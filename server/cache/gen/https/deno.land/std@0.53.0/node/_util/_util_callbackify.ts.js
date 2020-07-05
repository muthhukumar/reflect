// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
//
// Adapted from Node.js. Copyright Joyent, Inc. and other Node contributors.
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
// These are simplified versions of the "real" errors in Node.
class NodeFalsyValueRejectionError extends Error {
    constructor(reason) {
        super("Promise was rejected with falsy value");
        this.code = "ERR_FALSY_VALUE_REJECTION";
        this.reason = reason;
    }
}
class NodeInvalidArgTypeError extends TypeError {
    constructor(argumentName) {
        super(`The ${argumentName} argument must be of type function.`);
        this.code = "ERR_INVALID_ARG_TYPE";
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function callbackify(original) {
    if (typeof original !== "function") {
        throw new NodeInvalidArgTypeError('"original"');
    }
    const callbackified = function (...args) {
        const maybeCb = args.pop();
        if (typeof maybeCb !== "function") {
            throw new NodeInvalidArgTypeError("last");
        }
        const cb = (...args) => {
            maybeCb.apply(this, args);
        };
        original.apply(this, args).then((ret) => {
            setTimeout(cb.bind(this, null, ret), 0);
        }, (rej) => {
            rej = rej || new NodeFalsyValueRejectionError(rej);
            queueMicrotask(cb.bind(this, rej));
        });
    };
    const descriptors = Object.getOwnPropertyDescriptors(original);
    // It is possible to manipulate a functions `length` or `name` property. This
    // guards against the manipulation.
    if (typeof descriptors.length.value === "number") {
        descriptors.length.value++;
    }
    if (typeof descriptors.name.value === "string") {
        descriptors.name.value += "Callbackified";
    }
    Object.defineProperties(callbackified, descriptors);
    return callbackified;
}
export { callbackify };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3V0aWxfY2FsbGJhY2tpZnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJodHRwczovL2Rlbm8ubGFuZC9zdGRAMC41My4wL25vZGUvX3V0aWwvX3V0aWxfY2FsbGJhY2tpZnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLEVBQUU7QUFDRiw0RUFBNEU7QUFDNUUsRUFBRTtBQUNGLDBFQUEwRTtBQUMxRSxnRUFBZ0U7QUFDaEUsc0VBQXNFO0FBQ3RFLHNFQUFzRTtBQUN0RSw0RUFBNEU7QUFDNUUscUVBQXFFO0FBQ3JFLHdCQUF3QjtBQUN4QixFQUFFO0FBQ0YsMEVBQTBFO0FBQzFFLHlEQUF5RDtBQUN6RCxFQUFFO0FBQ0YsMEVBQTBFO0FBQzFFLDZEQUE2RDtBQUM3RCw0RUFBNEU7QUFDNUUsMkVBQTJFO0FBQzNFLHdFQUF3RTtBQUN4RSw0RUFBNEU7QUFDNUUseUNBQXlDO0FBRXpDLDhEQUE4RDtBQUM5RCxNQUFNLDRCQUE2QixTQUFRLEtBQUs7SUFHOUMsWUFBWSxNQUFlO1FBQ3pCLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1FBRjFDLFNBQUksR0FBRywyQkFBMkIsQ0FBQztRQUd4QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN2QixDQUFDO0NBQ0Y7QUFDRCxNQUFNLHVCQUF3QixTQUFRLFNBQVM7SUFFN0MsWUFBWSxZQUFvQjtRQUM5QixLQUFLLENBQUMsT0FBTyxZQUFZLHFDQUFxQyxDQUFDLENBQUM7UUFGM0QsU0FBSSxHQUFHLHNCQUFzQixDQUFDO0lBR3JDLENBQUM7Q0FDRjtBQWlERCw4REFBOEQ7QUFDOUQsU0FBUyxXQUFXLENBQUMsUUFBYTtJQUNoQyxJQUFJLE9BQU8sUUFBUSxLQUFLLFVBQVUsRUFBRTtRQUNsQyxNQUFNLElBQUksdUJBQXVCLENBQUMsWUFBWSxDQUFDLENBQUM7S0FDakQ7SUFFRCxNQUFNLGFBQWEsR0FBRyxVQUF5QixHQUFHLElBQWU7UUFDL0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzNCLElBQUksT0FBTyxPQUFPLEtBQUssVUFBVSxFQUFFO1lBQ2pDLE1BQU0sSUFBSSx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMzQztRQUNELE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFlLEVBQVEsRUFBRTtZQUN0QyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUM7UUFDRixRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQzdCLENBQUMsR0FBWSxFQUFFLEVBQUU7WUFDZixVQUFVLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzFDLENBQUMsRUFDRCxDQUFDLEdBQVksRUFBRSxFQUFFO1lBQ2YsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLDRCQUE0QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25ELGNBQWMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLENBQUMsQ0FDRixDQUFDO0lBQ0osQ0FBQyxDQUFDO0lBRUYsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9ELDZFQUE2RTtJQUM3RSxtQ0FBbUM7SUFDbkMsSUFBSSxPQUFPLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUNoRCxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQzVCO0lBQ0QsSUFBSSxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUM5QyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxlQUFlLENBQUM7S0FDM0M7SUFDRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3BELE9BQU8sYUFBYSxDQUFDO0FBQ3ZCLENBQUM7QUFFRCxPQUFPLEVBQUUsV0FBVyxFQUFFLENBQUMifQ==