// Copyright the Browserify authors. MIT License.
// Ported from https://github.com/browserify/path-browserify/
const { build } = Deno;
// Alphabet chars.
export const CHAR_UPPERCASE_A = 65; /* A */
export const CHAR_LOWERCASE_A = 97; /* a */
export const CHAR_UPPERCASE_Z = 90; /* Z */
export const CHAR_LOWERCASE_Z = 122; /* z */
// Non-alphabetic chars.
export const CHAR_DOT = 46; /* . */
export const CHAR_FORWARD_SLASH = 47; /* / */
export const CHAR_BACKWARD_SLASH = 92; /* \ */
export const CHAR_VERTICAL_LINE = 124; /* | */
export const CHAR_COLON = 58; /* : */
export const CHAR_QUESTION_MARK = 63; /* ? */
export const CHAR_UNDERSCORE = 95; /* _ */
export const CHAR_LINE_FEED = 10; /* \n */
export const CHAR_CARRIAGE_RETURN = 13; /* \r */
export const CHAR_TAB = 9; /* \t */
export const CHAR_FORM_FEED = 12; /* \f */
export const CHAR_EXCLAMATION_MARK = 33; /* ! */
export const CHAR_HASH = 35; /* # */
export const CHAR_SPACE = 32; /*   */
export const CHAR_NO_BREAK_SPACE = 160; /* \u00A0 */
export const CHAR_ZERO_WIDTH_NOBREAK_SPACE = 65279; /* \uFEFF */
export const CHAR_LEFT_SQUARE_BRACKET = 91; /* [ */
export const CHAR_RIGHT_SQUARE_BRACKET = 93; /* ] */
export const CHAR_LEFT_ANGLE_BRACKET = 60; /* < */
export const CHAR_RIGHT_ANGLE_BRACKET = 62; /* > */
export const CHAR_LEFT_CURLY_BRACKET = 123; /* { */
export const CHAR_RIGHT_CURLY_BRACKET = 125; /* } */
export const CHAR_HYPHEN_MINUS = 45; /* - */
export const CHAR_PLUS = 43; /* + */
export const CHAR_DOUBLE_QUOTE = 34; /* " */
export const CHAR_SINGLE_QUOTE = 39; /* ' */
export const CHAR_PERCENT = 37; /* % */
export const CHAR_SEMICOLON = 59; /* ; */
export const CHAR_CIRCUMFLEX_ACCENT = 94; /* ^ */
export const CHAR_GRAVE_ACCENT = 96; /* ` */
export const CHAR_AT = 64; /* @ */
export const CHAR_AMPERSAND = 38; /* & */
export const CHAR_EQUAL = 61; /* = */
// Digits
export const CHAR_0 = 48; /* 0 */
export const CHAR_9 = 57; /* 9 */
const isWindows = build.os == "windows";
export const SEP = isWindows ? "\\" : "/";
export const SEP_PATTERN = isWindows ? /[\\/]+/ : /\/+/;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2NvbnN0YW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjUzLjAvcGF0aC9fY29uc3RhbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUNqRCw2REFBNkQ7QUFFN0QsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQztBQUV2QixrQkFBa0I7QUFDbEIsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTztBQUMzQyxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUMsQ0FBQyxPQUFPO0FBQzNDLE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLEVBQUUsQ0FBQyxDQUFDLE9BQU87QUFDM0MsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLENBQUMsT0FBTztBQUU1Qyx3QkFBd0I7QUFDeEIsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxDQUFDLE9BQU87QUFDbkMsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTztBQUM3QyxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FBRyxFQUFFLENBQUMsQ0FBQyxPQUFPO0FBQzlDLE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxDQUFDLE9BQU87QUFDOUMsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxDQUFDLE9BQU87QUFDckMsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTztBQUM3QyxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTztBQUMxQyxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDLENBQUMsUUFBUTtBQUMxQyxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxFQUFFLENBQUMs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