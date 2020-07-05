/*!
 * Adapted directly from media-typer at https://github.com/jshttp/media-typer/
 * which is licensed as follows:
 *
 * media-typer
 * Copyright(c) 2014-2017 Douglas Christopher Wilson
 * MIT Licensed
 */
const SUBTYPE_NAME_REGEXP = /^[A-Za-z0-9][A-Za-z0-9!#$&^_.-]{0,126}$/;
const TYPE_NAME_REGEXP = /^[A-Za-z0-9][A-Za-z0-9!#$&^_-]{0,126}$/;
const TYPE_REGEXP = /^ *([A-Za-z0-9][A-Za-z0-9!#$&^_-]{0,126})\/([A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,126}) *$/;
class MediaType {
    constructor(
    /** The type of the media type. */
    type, 
    /** The subtype of the media type. */
    subtype, 
    /** The optional suffix of the media type. */
    suffix) {
        this.type = type;
        this.subtype = subtype;
        this.suffix = suffix;
    }
}
/** Given a media type object, return a media type string.
 *
 *       format({
 *         type: "text",
 *         subtype: "html"
 *       }); // returns "text/html"
 */
export function format(obj) {
    const { subtype, suffix, type } = obj;
    if (!TYPE_NAME_REGEXP.test(type)) {
        throw new TypeError("Invalid type.");
    }
    if (!SUBTYPE_NAME_REGEXP.test(subtype)) {
        throw new TypeError("Invalid subtype.");
    }
    let str = `${type}/${subtype}`;
    if (suffix) {
        if (!TYPE_NAME_REGEXP.test(suffix)) {
            throw new TypeError("Invalid suffix.");
        }
        str += `+${suffix}`;
    }
    return str;
}
/** Given a media type string, return a media type object.
 *
 *       parse("application/json-patch+json");
 *       // returns {
 *       //   type: "application",
 *       //   subtype: "json-patch",
 *       //   suffix: "json"
 *       // }
 */
export function parse(str) {
    const match = TYPE_REGEXP.exec(str.toLowerCase());
    if (!match) {
        throw new TypeError("Invalid media type.");
    }
    let [, type, subtype] = match;
    let suffix;
    const idx = subtype.lastIndexOf("+");
    if (idx !== -1) {
        suffix = subtype.substr(idx + 1);
        subtype = subtype.substr(0, idx);
    }
    return new MediaType(type, subtype, suffix);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkaWFUeXBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1lZGlhVHlwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7R0FPRztBQUVILE1BQU0sbUJBQW1CLEdBQUcseUNBQXlDLENBQUM7QUFDdEUsTUFBTSxnQkFBZ0IsR0FBRyx3Q0FBd0MsQ0FBQztBQUNsRSxNQUFNLFdBQVcsR0FDZix3RkFBd0YsQ0FBQztBQUUzRixNQUFNLFNBQVM7SUFDYjtJQUNFLGtDQUFrQztJQUMzQixJQUFZO0lBQ25CLHFDQUFxQztJQUM5QixPQUFlO0lBQ3RCLDZDQUE2QztJQUN0QyxNQUFlO1FBSmYsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUVaLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFFZixXQUFNLEdBQU4sTUFBTSxDQUFTO0lBQ3JCLENBQUM7Q0FDTDtBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSxNQUFNLENBQUMsR0FBYztJQUNuQyxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUM7SUFFdEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNoQyxNQUFNLElBQUksU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQ3RDO0lBQ0QsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUN0QyxNQUFNLElBQUksU0FBUyxDQUFDLGtCQUFrQixDQUFDLENBQUM7S0FDekM7SUFFRCxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksSUFBSSxPQUFPLEVBQUUsQ0FBQztJQUUvQixJQUFJLE1BQU0sRUFBRTtRQUNWLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDbEMsTUFBTSxJQUFJLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1NBQ3hDO1FBRUQsR0FBRyxJQUFJLElBQUksTUFBTSxFQUFFLENBQUM7S0FDckI7SUFFRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sVUFBVSxLQUFLLENBQUMsR0FBVztJQUMvQixNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBRWxELElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDVixNQUFNLElBQUksU0FBUyxDQUFDLHFCQUFxQixDQUFDLENBQUM7S0FDNUM7SUFFRCxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQzlCLElBQUksTUFBMEIsQ0FBQztJQUUvQixNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3JDLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQ2QsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztLQUNsQztJQUVELE9BQU8sSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM5QyxDQUFDIn0=