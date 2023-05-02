const byteToUnicode = require("./byteToUnicode")

// Simple mapping of unicode characters to byte
const unicodeToBytes = {};
for (const byte in byteToUnicode) {
	unicodeToBytes[byteToUnicode[byte]] = parseInt(byte);
}
module.exports = unicodeToBytes;