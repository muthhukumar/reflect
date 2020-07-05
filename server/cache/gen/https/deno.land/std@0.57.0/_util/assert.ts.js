// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
export class DenoStdInternalError extends Error {
    constructor(message) {
        super(message);
        this.name = "DenoStdInternalError";
    }
}
/** Make an assertion, if not `true`, then throw. */
export function assert(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXJ0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuNTcuMC9fdXRpbC9hc3NlcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxLQUFLO0lBQzdDLFlBQVksT0FBZTtRQUN6QixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLHNCQUFzQixDQUFDO0lBQ3JDLENBQUM7Q0FDRjtBQUVELG9EQUFvRDtBQUNwRCxNQUFNLFVBQVUsTUFBTSxDQUFDLElBQWEsRUFBRSxHQUFHLEdBQUcsRUFBRTtJQUM1QyxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1QsTUFBTSxJQUFJLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3JDO0FBQ0gsQ0FBQyJ9