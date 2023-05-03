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

// Get the vocab, merges, and special 'addeed tokens' from the tokenizer config
// ---

// Map of unicode valeus to token IDs
const vocab = tokenizerConfig['model']['vocab'];

// List of merges
const merges = tokenizerConfig['model']['merges'];

// Additional token mapping of token IDs to unicode values
const addedTokens = {};
for (const token of tokenizerConfig['added_tokens']) {
	addedTokens[parseInt(token['id'])] = token['content'];
}

// Process the added tokens to their vocab representation
const addedTokensTokensMap = {};
for (const tokenID in addedTokens) {
	addedTokensTokensMap[tokenID] = Buffer.from(addedTokens[tokenID], 'utf-8')
	.reduce((result, byte) => {
		result.push(vocab[byteToUnicode[byte]]);
		return result;
	}, []); 
}

// Ensure the added tokens are in the vocab
for (const addedTokenId in addedTokens) {
	const encodedAddedToken = Buffer.from(addedTokens[addedTokenId], 'utf-8')
	.reduce((result, byte) => {
		result.push(byteToUnicode[byte]);
		return result;
	}, []).toString('utf-8');
	vocab[encodedAddedToken] = addedTokenId;
}

// And the reverse vocab
const vocabReversed = {};
for (const token in vocab) {
	vocabReversed[parseInt(vocab[token])] = token;
}

// Precompute the merges vocab token pairs (speed up the encoding)
const processedMerges = merges.map((merge) => {
	const space = merge.indexOf(' ');
	if (space === -1) {
		throw new Error("Space not found in merge");
	}
	const tokenA = vocab[merge.slice(0, space)];
	const tokenB = vocab[merge.slice(space + 1)];
	const tokenMerged = vocab[merge.replace(" ", "")];
	return { tokenA, tokenB, tokenMerged };
});

//----------------------------------
// Utils
//----------------------------------

/**
 * Replace all occurance of A subequence in the provided list with B.
 * @param {Array<Int>} lst 
 * @param {Array<Int>} a 
 * @param {Array<Int>} b 
 */
function replaceSubsequence(lst, a, b) {
	for (let i = 0; i < lst.length; i++) {
		// Last do an optimized fast fail 
		// match for the first number
		if (lst[i] !== a[0]) {
			continue;
		}

		// Lets try to match the subsequence
		// from 2nd number onwards
		let matchFound = true;
		for(let j = 0; j < a.length; j++) {
			if (lst[i + j] !== a[j]) {
				matchFound = false;
				break;
			}
		}

		// Skip if no match
		if (!matchFound) {
			continue;
		}

		// Replace the subsequence
		lst.splice(i, a.length, ...b);
	}
}

const splitwords_pattern = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;
function splitWords(s) {
	const result = [];
	for (const match of s.matchAll(splitwords_pattern)) {
		result.push(match[0]);
	}
	return result;
}

function encodeAddedTokens(s) {
	const result = [];
	
	let remainder = s;
	
	while (remainder.length > 0) {
		let nearestPos = remainder.length;
		let nearestToken = -1;
		
		for (const addedTokenId in addedTokens) {
			const pos = remainder.indexOf(addedTokens[addedTokenId]);
			
			if (pos !== -1 && pos < nearestPos) {
				nearestPos = pos;
				nearestToken = parseInt(addedTokenId);
			}
		}
		
		if (nearestPos === remainder.length) {
			result.push(remainder);
			
			break;
		}
		
		if (nearestPos !== 0) {
			result.push(remainder.slice(0, nearestPos));
		}
		
		result.push(nearestToken);
		remainder = remainder.slice(nearestPos + addedTokens[nearestToken].length);
	}
	
	return result.flat();
}

//----------------------------------
// Encode and decode functions
//----------------------------------

// Converts a string to a list of tokens.
function encode(s) {
	// Normalize input string
	s = s.normalize(tokenizerConfig.normalizer.type);
	
	const result = [];
	
	const encodedParts = encodeAddedTokens(s);
	
	for (const part of encodedParts) {
		if (typeof part === 'number') {
			result.push(part);
		} else if (typeof part === 'string') {
			// Get the word tokens
			const wordTokens = splitWords(part)

			// Iterate each word
			for (const word of wordTokens) {
				let tokens = Buffer.from(word, 'utf-8')
				.reduce((result, byte) => {
					result.push(vocab[byteToUnicode[byte]]);
					return result;
				}, []);

				for (const addedTokenId in addedTokensTokensMap) {
					replaceSubsequence(tokens, addedTokensTokensMap[addedTokenId], [addedTokenId]);
				}

				for (const mergeObj of processedMerges) {
					const { tokenA, tokenB, tokenMerged } = mergeObj;
					
					for (let i = 0; i < tokens.length - 1; i++) {
						if (tokens[i] === tokenA && tokens[i + 1] === tokenB) {
							tokens[i] = tokenMerged;
							tokens.splice(i + 1, 1);
							i--;
						}
					}
				}

				result.push(...tokens);
			}
		} else {
			throw new Error(`Unknown part type ${typeof part} : ${part}`);
		}
	}
	
	return result.flat();
}

// Converts a list of tokens to a string.
function decode(tokens) {
	let result = [];
	
	for (const token of tokens) {
		if(token in addedTokens) {
			const tokenString = addedTokens[token];
			const decodedPart = Array.from(tokenString, (c) => c.charCodeAt(0));
			result = result.concat(decodedPart);
		} else if(token in vocabReversed) {
			const tokenString = vocabReversed[token];
			const decodedPart = Array.from(tokenString, (c) => unicodeToBytes[c]);
			result = result.concat(decodedPart);
		} else {
			throw new Error(`Token ${token} not found in vocab`);
		}
	}
	
	return Buffer.from(result).toString('utf-8');
}

//----------------------------------
// Module export
//----------------------------------
module.exports = {
	encode,
	decode
}