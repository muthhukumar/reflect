export function notImplemented(msg) {
    const message = msg ? `Not implemented: ${msg}` : "Not implemented";
    throw new Error(message);
}
export const _TextDecoder = TextDecoder;
export const _TextEncoder = TextEncoder;
export function intoCallbackAPI(
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
func, cb, 
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
...args) {
    func(...args)
        .then((value) => cb && cb(null, value))
        .catch((err) => cb && cb(err, null));
}
export function intoCallbackAPIWithIntercept(
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
func, interceptor, cb, 
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
...args) {
    func(...args)
        .then((value) => cb && cb(null, interceptor(value)))
        .catch((err) => cb && cb(err, null));
}
export function spliceOne(list, index) {
    for (; index + 1 < list.length; index++)
        list[index] = list[index + 1];
    list.pop();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3V0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuNTMuMC9ub2RlL191dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFVBQVUsY0FBYyxDQUFDLEdBQVk7SUFDekMsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDO0lBQ3BFLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDM0IsQ0FBQztBQUdELE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUM7QUFHeEMsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQztBQVF4QyxNQUFNLFVBQVUsZUFBZTtBQUM3QixpRUFBaUU7QUFDakUsSUFBb0MsRUFDcEMsRUFBcUU7QUFDckUsaUVBQWlFO0FBQ2pFLEdBQUcsSUFBVztJQUVkLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztTQUNWLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDdEMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLENBQUM7QUFFRCxNQUFNLFVBQVUsNEJBQTRCO0FBQzFDLGlFQUFpRTtBQUNqRSxJQUFxQyxFQUNyQyxXQUEwQixFQUMxQixFQUFzRTtBQUN0RSxpRUFBaUU7QUFDakUsR0FBRyxJQUFXO0lBRWQsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1NBQ1YsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUNuRCxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDekMsQ0FBQztBQUVELE1BQU0sVUFBVSxTQUFTLENBQUMsSUFBYyxFQUFFLEtBQWE7SUFDckQsT0FBTyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFO1FBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdkUsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2IsQ0FBQyJ9