// Copyright 2020-present the denosaurs team. All rights reserved. MIT license.
import { log, deferred, globToRegExp, extname, relative, walk, delay, } from "../deps.ts";
/**
 * Watches for file changes in `paths` path
 * yielding an array of all of the changes
 * each time one or more changes are detected.
 * It is debounced by `interval`, `recursive`, `exts`,
 * `match` and `skip` are filtering the files which
 * will yield a change
 */
export class Watcher {
    constructor(config = {}) {
        this.#signal = deferred();
        this.#changes = {};
        this.#paths = [Deno.cwd()];
        this.#interval = 350;
        this.#exts = undefined;
        this.#match = undefined;
        this.#skip = undefined;
        this.#watch = this.denoWatch;
        this.#config = config;
        this.reload();
    }
    #signal;
    #changes;
    #paths;
    #interval;
    #exts;
    #match;
    #skip;
    #watch;
    #config;
    reload() {
        this.#watch = this.#config.legacy ? this.legacyWatch : this.denoWatch;
        if (this.#config.paths) {
            this.#paths = this.#config.paths;
        }
        if (this.#config.interval) {
            this.#interval = this.#config.interval;
        }
        if (this.#config.exts) {
            this.#exts = this.#config.exts.map((_) => _.startsWith(".") ? _ : `.${_}`);
        }
        if (this.#config.match) {
            this.#match = this.#config.match.map((_) => globToRegExp(_, { extended: true, globstar: false }));
        }
        if (this.#config.skip) {
            this.#skip = this.#config.skip.map((_) => globToRegExp(_, { extended: true, globstar: false }));
        }
    }
    isWatched(path) {
        path = this.verifyPath(path);
        if (extname(path) && this.#exts?.length &&
            this.#exts?.every((ext) => !path.endsWith(ext))) {
            log.debug(`path ${path} does not have right extension`);
            return false;
        }
        else if (this.#skip?.length && this.#skip?.some((skip) => path.match(skip))) {
            log.debug(`path ${path} is skipped`);
            return false;
        }
        else if (this.#match?.length && this.#match?.every((match) => !path.match(match))) {
            log.debug(`path ${path} is not matched`);
            return false;
        }
        log.debug(`path ${path} is matched`);
        return true;
    }
    reset() {
        this.#changes = {};
        this.#signal = deferred();
    }
    verifyPath(path) {
        for (const directory of this.#paths) {
            const rel = relative(directory, path);
            if (rel && !rel.startsWith("..")) {
                path = relative(directory, path);
            }
        }
        return path;
    }
    async *iterate() {
        this.#watch();
        while (true) {
            await this.#signal;
            yield Object.entries(this.#changes).map(([path, type,]) => ({ path, type }));
            this.reset();
        }
    }
    [Symbol.asyncIterator]() {
        return this.iterate();
    }
    async denoWatch() {
        let timer = 0;
        const debounce = () => {
            clearTimeout(timer);
            timer = setTimeout(this.#signal.resolve, this.#interval);
        };
        const run = async () => {
            for await (const event of Deno.watchFs(this.#paths)) {
                const { kind, paths } = event;
                for (const path of paths) {
                    if (this.isWatched(path)) {
                        if (!this.#changes[path])
                            this.#changes[path] = [];
                        this.#changes[path].push(kind);
                        debounce();
                    }
                }
            }
        };
        run();
        while (true) {
            debounce();
            await delay(this.#interval);
        }
    }
    async legacyWatch() {
        let timer = 0;
        const debounce = () => {
            clearTimeout(timer);
            timer = setTimeout(this.#signal.resolve, this.#interval);
        };
        const walkPaths = async () => {
            const tree = {};
            for (let i in this.#paths) {
                const action = walk(this.#paths[i], {
                    maxDepth: Infinity,
                    includeDirs: false,
                    followSymlinks: false,
                    exts: this.#exts,
                    match: this.#match,
                    skip: this.#skip,
                });
                for await (const { path } of action) {
                    if (this.isWatched(path)) {
                        const stat = await Deno.stat(path);
                        tree[path] = stat.mtime;
                    }
                }
            }
            return tree;
        };
        let previous = await walkPaths();
        while (true) {
            const current = await walkPaths();
            for (const path in previous) {
                const pre = previous[path];
                const post = current[path];
                if (pre && !post) {
                    this.#changes[path].push("remove");
                }
                else if (pre &&
                    post &&
                    pre.getTime() !== post.getTime()) {
                    this.#changes[path].push("modify");
                }
            }
            for (const path in current) {
                if (!previous[path] && current[path]) {
                    this.#changes[path].push("create");
                }
            }
            previous = current;
            debounce();
            await delay(this.#interval);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZGVub25AdjIuMi4wL3NyYy93YXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtFQUErRTtBQUUvRSxPQUFPLEVBQ0wsR0FBRyxFQUNILFFBQVEsRUFDUixZQUFZLEVBQ1osT0FBTyxFQUNQLFFBQVEsRUFDUixJQUFJLEVBQ0osS0FBSyxHQUNOLE1BQU0sWUFBWSxDQUFDO0FBcUNwQjs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxPQUFPLE9BQU87SUFXbEIsWUFBWSxTQUF3QixFQUFFO1FBVnRDLFlBQU8sR0FBRyxRQUFRLEVBQUUsQ0FBQztRQUNyQixhQUFRLEdBQW9DLEVBQUUsQ0FBQztRQUMvQyxXQUFNLEdBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNoQyxjQUFTLEdBQVcsR0FBRyxDQUFDO1FBQ3hCLFVBQUssR0FBYyxTQUFTLENBQUM7UUFDN0IsV0FBTSxHQUFjLFNBQVMsQ0FBQztRQUM5QixVQUFLLEdBQWMsU0FBUyxDQUFDO1FBQzdCLFdBQU0sR0FBYSxJQUFJLENBQUMsU0FBUyxDQUFDO1FBSWhDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNoQixDQUFDO0lBYkQsT0FBTyxDQUFjO0lBQ3JCLFFBQVEsQ0FBdUM7SUFDL0MsTUFBTSxDQUEwQjtJQUNoQyxTQUFTLENBQWU7SUFDeEIsS0FBSyxDQUF3QjtJQUM3QixNQUFNLENBQXdCO0lBQzlCLEtBQUssQ0FBd0I7SUFDN0IsTUFBTSxDQUE0QjtJQUNsQyxPQUFPLENBQWdCO0lBT3ZCLE1BQU07UUFDSixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMs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