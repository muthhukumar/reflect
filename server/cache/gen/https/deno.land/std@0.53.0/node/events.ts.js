// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
// Copyright (c) 2019 Denolibs authors. All rights reserved. MIT license.
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
import { validateIntegerRange } from "./util.ts";
import { assert } from "../testing/asserts.ts";
/**
 * See also https://nodejs.org/api/events.html
 */
let EventEmitter = /** @class */ (() => {
    class EventEmitter {
        constructor() {
            this._events = new Map();
        }
        _addListener(eventName, listener, prepend) {
            this.emit("newListener", eventName, listener);
            if (this._events.has(eventName)) {
                const listeners = this._events.get(eventName);
                if (prepend) {
                    listeners.unshift(listener);
                }
                else {
                    listeners.push(listener);
                }
            }
            else {
                this._events.set(eventName, [listener]);
            }
            const max = this.getMaxListeners();
            if (max > 0 && this.listenerCount(eventName) > max) {
                const warning = new Error(`Possible EventEmitter memory leak detected.
         ${this.listenerCount(eventName)} ${eventName.toString()} listeners.
         Use emitter.setMaxListeners() to increase limit`);
                warning.name = "MaxListenersExceededWarning";
                console.warn(warning);
            }
            return this;
        }
        /** Alias for emitter.on(eventName, listener). */
        addListener(eventName, listener) {
            return this._addListener(eventName, listener, false);
        }
        /**
         * Synchronously calls each of the listeners registered for the event named
         * eventName, in the order they were registered, passing the supplied
         * arguments to each.
         * @return true if the event had listeners, false otherwise
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        emit(eventName, ...args) {
            if (this._events.has(eventName)) {
                if (eventName === "error" &&
                    this._events.get(EventEmitter.errorMonitor)) {
                    this.emit(EventEmitter.errorMonitor, ...args);
                }
                const listeners = this._events.get(eventName).slice(); // We copy with slice() so array is not mutated during emit
                for (const listener of listeners) {
                    try {
                        listener.apply(this, args);
                    }
                    catch (err) {
                        this.emit("error", err);
                    }
                }
                return true;
            }
            else if (eventName === "error") {
                if (this._events.get(EventEmitter.errorMonitor)) {
                    this.emit(EventEmitter.errorMonitor, ...args);
                }
                const errMsg = args.length > 0 ? args[0] : Error("Unhandled error.");
                throw errMsg;
            }
            return false;
        }
        /**
         * Returns an array listing the events for which the emitter has
         * registered listeners.
         */
        eventNames() {
            return Array.from(this._events.keys());
        }
        /**
         * Returns the current max listener value for the EventEmitter which is
         * either set by emitter.setMaxListeners(n) or defaults to
         * EventEmitter.defaultMaxListeners.
         */
        getMaxListeners() {
            return this.maxListeners || EventEmitter.defaultMaxListeners;
        }
        /**
         * Returns the number of listeners listening to the event named
         * eventName.
         */
        listenerCount(eventName) {
            if (this._events.has(eventName)) {
                return this._events.get(eventName).length;
            }
            else {
                return 0;
            }
        }
        _listeners(target, eventName, unwrap) {
            if (!target._events.has(eventName)) {
                return [];
            }
            const eventListeners = target._events.get(eventName);
            return unwrap
                ? this.unwrapListeners(eventListeners)
                : eventListeners.slice(0);
        }
        unwrapListeners(arr) {
            const unwrappedListeners = new Array(arr.length);
            for (let i = 0; i < arr.length; i++) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                unwrappedListeners[i] = arr[i]["listener"] || arr[i];
            }
            return unwrappedListeners;
        }
        /** Returns a copy of the array of listeners for the event named eventName.*/
        listeners(eventName) {
            return this._listeners(this, eventName, true);
        }
        /**
         * Returns a copy of the array of listeners for the event named eventName,
         * including any wrappers (such as those created by .once()).
         */
        rawListeners(eventName) {
            return this._listeners(this, eventName, false);
        }
        /** Alias for emitter.removeListener(). */
        off(eventName, listener) {
            return this.removeListener(eventName, listener);
        }
        /**
         * Adds the listener function to the end of the listeners array for the event
         *  named eventName. No checks are made to see if the listener has already
         * been added. Multiple calls passing the same combination of eventName and
         * listener will result in the listener being added, and called, multiple
         * times.
         */
        on(eventName, listener) {
            return this.addListener(eventName, listener);
        }
        /**
         * Adds a one-time listener function for the event named eventName. The next
         * time eventName is triggered, this listener is removed and then invoked.
         */
        once(eventName, listener) {
            const wrapped = this.onceWrap(eventName, listener);
            this.on(eventName, wrapped);
            return this;
        }
        // Wrapped function that calls EventEmitter.removeListener(eventName, self) on execution.
        onceWrap(eventName, listener) {
            const wrapper = function (...args // eslint-disable-line @typescript-eslint/no-explicit-any
            ) {
                this.context.removeListener(this.eventName, this.rawListener);
                this.listener.apply(this.context, args);
            };
            const wrapperContext = {
                eventName: eventName,
                listener: listener,
                rawListener: wrapper,
                context: this,
            };
            const wrapped = wrapper.bind(wrapperContext);
            wrapperContext.rawListener = wrapped;
            wrapped.listener = listener;
            return wrapped;
        }
        /**
         * Adds the listener function to the beginning of the listeners array for the
         *  event named eventName. No checks are made to see if the listener has
         * already been added. Multiple calls passing the same combination of
         * eventName and listener will result in the listener being added, and
         * called, multiple times.
         */
        prependListener(eventName, listener) {
            return this._addListener(eventName, listener, true);
        }
        /**
         * Adds a one-time listener function for the event named eventName to the
         * beginning of the listeners array. The next time eventName is triggered,
         * this listener is removed, and then invoked.
         */
        prependOnceListener(eventName, listener) {
            const wrapped = this.onceWrap(eventName, listener);
            this.prependListener(eventName, wrapped);
            return this;
        }
        /** Removes all listeners, or those of the specified eventName. */
        removeAllListeners(eventName) {
            if (this._events === undefined) {
                return this;
            }
            if (eventName && this._events.has(eventName)) {
                const listeners = this._events.get(eventName).slice(); // Create a copy; We use it AFTER it's deleted.
                this._events.delete(eventName);
                for (const listener of listeners) {
                    this.emit("removeListener", eventName, listener);
                }
            }
            else {
                const eventList = this.eventNames();
                eventList.map((value) => {
                    this.removeAllListeners(value);
                });
            }
            return this;
        }
        /**
         * Removes the specified listener from the listener array for the event
         * named eventName.
         */
        removeListener(eventName, listener) {
            if (this._events.has(eventName)) {
                const arr = this._events.get(eventName);
                assert(arr);
                let listenerIndex = -1;
                for (let i = arr.length - 1; i >= 0; i--) {
                    // arr[i]["listener"] is the reference to the listener inside a bound 'once' wrapper
                    if (arr[i] == listener ||
                        (arr[i] && arr[i]["listener"] == listener)) {
                        listenerIndex = i;
                        break;
                    }
                }
                if (listenerIndex >= 0) {
                    arr.splice(listenerIndex, 1);
                    this.emit("removeListener", eventName, listener);
                    if (arr.length === 0) {
                        this._events.delete(eventName);
                    }
                }
            }
            return this;
        }
        /**
         * By default EventEmitters will print a warning if more than 10 listeners
         * are added for a particular event. This is a useful default that helps
         * finding memory leaks. Obviously, not all events should be limited to just
         * 10 listeners. The emitter.setMaxListeners() method allows the limit to be
         * modified for this specific EventEmitter instance. The value can be set to
         * Infinity (or 0) to indicate an unlimited number of listeners.
         */
        setMaxListeners(n) {
            validateIntegerRange(n, "maxListeners", 0);
            this.maxListeners = n;
            return this;
        }
    }
    EventEmitter.defaultMaxListeners = 10;
    EventEmitter.errorMonitor = Symbol("events.errorMonitor");
    return EventEmitter;
})();
export default EventEmitter;
export { EventEmitter };
/**
 * Creates a Promise that is fulfilled when the EventEmitter emits the given
 * event or that is rejected when the EventEmitter emits 'error'. The Promise
 * will resolve with an array of all the arguments emitted to the given event.
 */
export function once(emitter, name
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) {
    return new Promise((resolve, reject) => {
        if (emitter instanceof EventTarget) {
            // EventTarget does not have `error` event semantics like Node
            // EventEmitters, we do not listen to `error` events here.
            emitter.addEventListener(name, (...args) => {
                resolve(args);
            }, { once: true, passive: false, capture: false });
            return;
        }
        else if (emitter instanceof EventEmitter) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const eventListener = (...args) => {
                if (errorListener !== undefined) {
                    emitter.removeListener("error", errorListener);
                }
                resolve(args);
            };
            let errorListener;
            // Adding an error listener is not optional because
            // if an error is thrown on an event emitter we cannot
            // guarantee that the actual event we are waiting will
            // be fired. The result could be a silent way to create
            // memory or file descriptor leaks, which is something
            // we should avoid.
            if (name !== "error") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                errorListener = (err) => {
                    emitter.removeListener(name, eventListener);
                    reject(err);
                };
                emitter.once("error", errorListener);
            }
            emitter.once(name, eventListener);
            return;
        }
    });
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createIterResult(value, done) {
    return { value, done };
}
/**
 * Returns an AsyncIterator that iterates eventName events. It will throw if
 * the EventEmitter emits 'error'. It removes all listeners when exiting the
 * loop. The value returned by each iteration is an array composed of the
 * emitted event arguments.
 */
export function on(emitter, event) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unconsumedEventValues = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unconsumedPromises = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let error = null;
    let finished = false;
    const iterator = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        next() {
            // First, we consume all unread events
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const value = unconsumedEventValues.shift();
            if (value) {
                return Promise.resolve(createIterResult(value, false));
            }
            // Then we error, if an error happened
            // This happens one time if at all, because after 'error'
            // we stop listening
            if (error) {
                const p = Promise.reject(error);
                // Only the first element errors
                error = null;
                return p;
            }
            // If the iterator is finished, resolve to done
            if (finished) {
                return Promise.resolve(createIterResult(undefined, true));
            }
            // Wait until an event happens
            return new Promise(function (resolve, reject) {
                unconsumedPromises.push({ resolve, reject });
            });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return() {
            emitter.removeListener(event, eventHandler);
            emitter.removeListener("error", errorHandler);
            finished = true;
            for (const promise of unconsumedPromises) {
                promise.resolve(createIterResult(undefined, true));
            }
            return Promise.resolve(createIterResult(undefined, true));
        },
        throw(err) {
            error = err;
            emitter.removeListener(event, eventHandler);
            emitter.removeListener("error", errorHandler);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [Symbol.asyncIterator]() {
            return this;
        },
    };
    emitter.on(event, eventHandler);
    emitter.on("error", errorHandler);
    return iterator;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function eventHandler(...args) {
        const promise = unconsumedPromises.shift();
        if (promise) {
            promise.resolve(createIterResult(args, false));
        }
        else {
            unconsumedEventValues.push(args);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function errorHandler(err) {
        finished = true;
        const toError = unconsumedPromises.shift();
        if (toError) {
            toError.reject(err);
        }
        else {
            // The next time we call next()
            error = err;
        }
        iterator.return();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuNTMuMC9ub2RlL2V2ZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUseUVBQXlFO0FBQ3pFLHNEQUFzRDtBQUN0RCxFQUFFO0FBQ0YsMEVBQTBFO0FBQzFFLGdFQUFnRTtBQUNoRSxzRUFBc0U7QUFDdEUsc0VBQXNFO0FBQ3RFLDRFQUE0RTtBQUM1RSxxRUFBcUU7QUFDckUsd0JBQXdCO0FBQ3hCLEVBQUU7QUFDRiwwRUFBMEU7QUFDMUUseURBQXlEO0FBQ3pELEVBQUU7QUFDRiwwRUFBMEU7QUFDMUUsNkRBQTZEO0FBQzdELDRFQUE0RTtBQUM1RSwyRUFBMkU7QUFDM0Usd0VBQXdFO0FBQ3hFLDRFQUE0RTtBQUM1RSx5Q0FBeUM7QUFFekMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ2pELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQU0vQzs7R0FFRztBQUNIO0lBQUEsTUFBcUIsWUFBWTtRQU0vQjtZQUNFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBRU8sWUFBWSxDQUNsQixTQUEwQixFQUMxQixRQUFvQyxFQUNwQyxPQUFnQjtZQUVoQixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDOUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDL0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUUzQyxDQUFDO2dCQUNGLElBQUksT0FBTyxFQUFFO29CQUNYLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQzdCO3FCQUFNO29CQUNMLFNB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