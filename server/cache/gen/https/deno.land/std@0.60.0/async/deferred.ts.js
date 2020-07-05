/** Creates a Promise with the `reject` and `resolve` functions
 * placed as methods on the promise object itself. It allows you to do:
 *
 *     const p = deferred<number>();
 *     // ...
 *     p.resolve(42);
 */
export function deferred() {
    let methods;
    const promise = new Promise((resolve, reject) => {
        methods = { resolve, reject };
    });
    return Object.assign(promise, methods);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmZXJyZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkZWZlcnJlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFZQTs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsUUFBUTtJQUN0QixJQUFJLE9BQU8sQ0FBQztJQUNaLE1BQU0sT0FBTyxHQUFHLElBQUksT0FBTyxDQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBUSxFQUFFO1FBQ3ZELE9BQU8sR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUNoQyxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFnQixDQUFDO0FBQ3hELENBQUMifQ==