//----------------------------------
// Config and dependencies loading
//----------------------------------

// Get the unicode to byte matching pairs
const byteToUnicode = require("./byteToUnicode")
const unicodeToBytes = require("./unicodeToByte")

// Get the tokenizer config JSON
const tokenizerConfig = require("../20B_tokenizer.json")

// Get the TextEncoder and TextDecoder
const { TextEncoder, TextDecoder } = require('util');

//----------------------------------
// Vocab building
//----------------------------------

// Get the vocab and merges from the tokenizer config
const vocab = tokenizerConfig['model']['vocab'];
const merges = tokenizerConfig['model']['merges'];
const addedTokens = {};
for (const token of tokenizerConfig['added_tokens']) {
	addedTokens[token['id']] = token['content'];
}
for (const addedTokenId in addedTokens) {
	const encoded_added_token = Array.from(addedTokens[addedTokenId], (c) => byteToUnicode[c.charCodeAt(0)]).join('');
	vocab[encoded_added_token] = addedTokenId;
}
const vocabReversed = {};
for (const token in vocab) {
	vocabReversed[vocab[token]] = token;
}

//----------------------------------
// Utils
//----------------------------------

function replaceSubsequence(lst, a, b) {
	for (let i = 0; i < lst.length; i++) {
		if (lst.slice(i, i + a.length).join() === a.join()) {
			lst.splice(i, a.length, ...b);
		}
	}
}

//----------------------------------
// Encode and decode functions
//----------------------------------

// Converts a string to a list of tokens.
function encode(s) {
	// Normalize input string
	s = s.normalize(tokenizerConfig.normalizer.type);
	
	// Handle surrogate pair conversion separately
	function convertCodePointToTokens(codePoint) {
        const bytes = (new TextEncoder()).encode(String.fromCodePoint(codePoint));
        const tokens = bytes.map((byte) => vocab[String.fromCharCode(byte)]);
        return tokens;
	}
	
	// Convert input string to tokens
	const s_tokens = Array.from(s, (c) => {
		// Check if c is a surrogate pair
		const codePoint = c.codePointAt(0);
		if (codePoint > 0xFFFF) {
			const highSurrogate = ((codePoint - 0x10000) >> 10) + 0xD800;
			const lowSurrogate = ((codePoint - 0x10000) % 0x400) + 0xDC00;
			return [convertCodePointToTokens(highSurrogate), convertCodePointToTokens(lowSurrogate)];
		} else {
			return convertCodePointToTokens(codePoint);
		}
	}).flat();
	
	let tokenCount = s_tokens.length;
	
	for (const merge of merges) {
		const space = merge.indexOf(' ');
		
		if (space === -1) {
			throw new Error('Invalid merge string');
		}
		
		const token_a = vocab[merge.substring(0, space)];
		const token_b = vocab[merge.substring(space + 1)];
		const token_merged = vocab[merge.replace(' ', '')];
		
		for (let i = 0; i < s_tokens.length - 1; i++) {
			if (i + 1 < s_tokens.length && s_tokens[i] === token_a && s_tokens[i + 1] === token_b) {
				s_tokens[i] = token_merged;
				s_tokens.splice(i + 1, 1);
				tokenCount -= 1;
			}
		}
	}
	
	// function apply_merges(tokens) {
	// 	let tokenChanged = false;
	// 	for (const merge of merges) {
	// 		const space = merge.indexOf(' ');
	
	// 		if (space === -1) {
	// 			throw new Error('Invalid merge string');
	// 		}
	
	// 		const token_a = vocab[merge.substring(0, space)];
	// 		const token_b = vocab[merge.substring(space + 1)];
	// 		const token_merged = vocab[merge.replace(' ', '')];
	
	// 		for (let i = 0; i < tokens.length - 1; i++) {
	// 			if (i + 1 < tokens.length && tokens[i] === token_a && tokens[i + 1] === token_b) {
	// 				tokens[i] = token_merged;
	// 				tokens.splice(i + 1, 1);
	// 				tokenChanged = true;
	// 			}
	// 		}
	// 	}
	
	// 	// If a token changed in the previous loop, try applying the merges again
	// 	if (tokenChanged) {
	// 		apply_merges(tokens);
	// 	}
	// }
	
	// apply_merges(s_tokens);
	
	return s_tokens.slice(0, tokenCount);
}

// Converts a list of tokens to a string.
function decode(tokens) {
	let result = [];
	
	for (const token of tokens) {
		if (token in addedTokens) {
			const addedToken = addedTokens[token];
			const decodedPart = Array.from(addedToken, (c) => c.charCodeAt(0));
			result = result.concat(decodedPart);
		} else if (token in vocabReversed) {
			const tokenString = vocabReversed[token];
			const decodedPart = Array.from(tokenString, (c) => unicodeToBytes[c]);
			result = result.concat(decodedPart);
		} else {
			console.log("result so far", result);
			throw new Error(`Unknown token: ${token}`);
		}
	}
	
	return Buffer.from(result).toString('utf8');
}

// //----------------------------------
// // Usage example
// //----------------------------------
// let input = "Hello world!";
// let result = encode(input);
// console.log(result);

//----------------------------------
// Module export
//----------------------------------
module.exports = {
	encode,
	decode
}