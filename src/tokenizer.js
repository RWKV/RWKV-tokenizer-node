//----------------------------------
// Config and dependencies loading
//----------------------------------

// Get the unicode to byte matching pairs
const byteToUnicode = require("./byteToUnicode")
const unicodeToBytes = require("./unicodeToByte")

// Get the tokenizer config JSON
const tokenizerConfig = require("../20B_tokenizer.json")

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
	
	// Convert input string to tokens
	const s_tokens = Array.from(s, (c) => vocab[byteToUnicode[c.charCodeAt(0)]]);
	
	for (const addedTokenId in addedTokens) {
		const addedToken_tokens = Array.from(addedTokens[addedTokenId], (c) => vocab[byteToUnicode[c.charCodeAt(0)]]);
		replaceSubsequence(s_tokens, addedToken_tokens, [parseInt(addedTokenId)]);
	}
	
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