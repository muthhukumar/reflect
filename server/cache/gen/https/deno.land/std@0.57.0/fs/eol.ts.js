// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
/** EndOfLine character enum */
export var EOL;
(function (EOL) {
    EOL["LF"] = "\n";
    EOL["CRLF"] = "\r\n";
})(EOL || (EOL = {}));
const regDetect = /(?:\r?\n)/g;
/**
 * Detect the EOL character for string input.
 * returns null if no newline
 */
export function detect(content) {
    const d = content.match(regDetect);
    if (!d || d.length === 0) {
        return null;
    }
    const crlf = d.filter((x) => x === EOL.CRLF);
    if (crlf.length > 0) {
        return EOL.CRLF;
    }
    else {
        return EOL.LF;
    }
}
/** Format the file to the targeted EOL */
export function format(content, eol) {
    return content.replace(regDetect, eol);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW9sLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuNTcuMC9mcy9lb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLCtCQUErQjtBQUMvQixNQUFNLENBQU4sSUFBWSxHQUdYO0FBSEQsV0FBWSxHQUFHO0lBQ2IsZ0JBQVMsQ0FBQTtJQUNULG9CQUFhLENBQUE7QUFDZixDQUFDLEVBSFcsR0FBRyxLQUFILEdBQUcsUUFHZDtBQUVELE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQztBQUUvQjs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsTUFBTSxDQUFDLE9BQWU7SUFDcEMsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNuQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3hCLE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFDRCxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBUyxFQUFXLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlELElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDbkIsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDO0tBQ2pCO1NBQU07UUFDTCxPQUFPLEdBQUcsQ0FBQyxFQUFFLENBQUM7S0FDZjtBQUNILENBQUM7QUFFRCwwQ0FBMEM7QUFDMUMsTUFBTSxVQUFVLE1BQU0sQ0FBQyxPQUFlLEVBQUUsR0FBUTtJQUM5QyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3pDLENBQUMifQ==