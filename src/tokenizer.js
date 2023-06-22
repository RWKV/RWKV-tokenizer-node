class TRIE {
	constructor(front = null, ch = null) {
	  const props = ["ch", "to", "values", "front"];
	  for (let i = 0; i < props.length; i++) {
		this[props[i]] = null;
	  }
	  this.to = new Array(256);
	  this.values = new Set();
	  this.front = front;
	  this.ch = ch;
	}
	
	add(key, idx = 0, val = null) {
	  if (idx === key.length) {
		if (val === null) {
		  val = key;
		}
		this.values.add(val);
		return this;
	  }
	  
	  const ch = key[idx];
	  
	  if (this.to[ch] === null) {
		this.to[ch] = new TRIE(this, ch);
	  }
	  
	  return this.to[ch].add(key, idx + 1, val);
	}
	
	find_longest(key, idx = 0) {
	  let u = this;
	  let ch = key[idx];
	  let ret = null;
	  
	  while (u.to[ch] !== null) {
		u = u.to[ch];
		idx++;
		
		if (u.values.size > 0) {
		  ret = [idx, u, u.values];
		}
		
		if (idx === key.length) {
		  break;
		}
		
		ch = key[idx];
	  }
	  
	  return ret;
	}
	
	toString() {
	  let fr = this;
	  let ret = [];
	  
	  while (fr !== null) {
		if (fr.ch !== null) {
		  ret.push(fr.ch);
		}
		
		fr = fr.front;
	  }
	  
	  return "<TRIE " + ret.reverse().join("") + " " + [...this.values] + ">";
	}
  }
  
  class TRIE_TOKENIZER {
	constructor(file_name) {
	  this.idx2token = {};
	  let sorted = []; // must be already sorted
	  
	  const fs = require("fs");
	  const lines = fs.readFileSync(file_name, "utf-8").split("\n");
	  
	  for (let i = 0; i < lines.length; i++) {
		const l = lines[i];
		const idx = parseInt(l.slice(0, l.indexOf(" ")));
		let x = eval(l.slice(l.indexOf(" "), l.lastIndexOf(" ")));
		x = typeof(x) === "string" ? Buffer.from(x) : x;
		sorted.push(x);
		this.idx2token[idx] = x;
	  }
	  
	  this.token2idx = {};
	  
	  for (const [k, v] of Object.entries(this.idx2token)) {
		this.token2idx[v] = parseInt(k);
	  }
	  
	  this.root = new TRIE();
	  
	  for (const [t, i] of Object.entries(this.token2idx)) {
		this.root.add(t, { val: [t, i] });
	  }
	}
	
	encodeBytes(src) {
	  let idx = 0;
	  const tokens = [];
	  
	  while (idx < src.length) {
		const _idx = idx;
		[idx, _, values] = this.root.find_longest(src, idx);
		if (idx === _idx) {
		  break;
		}
		
		const [, token] = [...values][0];
		tokens.push(token);
	  }
	  
	  return tokens;
	}
	
	decodeBytes(tokens) {
	  let res = Buffer.alloc(0);
	  
	  for (let i = 0; i < tokens.length; i++) {
		const token = this.idx2token[tokens[i]];
		
		if (token) {
		  res = Buffer.concat([res, token]);
		}
	  }
	  
	  return res;
	}
	
	encode(src) {
	  return this.encodeBytes(Buffer.from(src)).map(token => token.val[1]); }

	  decode(nums) { const tokens = nums.map(num => { const token = { val: [null, num] }; for (const [t, i] of Object.entries(this.token2idx)) { if (i === num) { token.val[0] = t; break; } } return token; });
	  
	  return this.decodeBytes(tokens);
	  
	  
	  } }
	  
	  // Example usage: const tokenizer = new TRIE_TOKENIZER("tokens.txt"); const encoded = tokenizer.encode("Hello, world!"); console.log(encoded); // [ 6, 29, 25, 25, 31, 12, 29, 27, 23, 30, 14, 15 ] const decoded = tokenizer.decode(encoded); console.log(decoded.toString()); // "Hello, world!"
  


// /*

// //----------------------------------
// // Config and dependencies loading
// //----------------------------------

// // Get the unicode to byte matching pairs
// const byteToUnicode = require("./byteToUnicode")
// const unicodeToBytes = require("./unicodeToByte")

// // Get the tokenizer config JSON
// const tokenizerConfig = require("../20B_tokenizer.json")

// //----------------------------------
// // Vocab building
// //----------------------------------

// // Get the vocab, merges, and special 'addeed tokens' from the tokenizer config
// // ---

// // Map of unicode values to token IDs
// const vocab = tokenizerConfig['model']['vocab'];

// // List of merges
// const merges = tokenizerConfig['model']['merges'];

// // Precompute the token unicode vocab values
// const byteToUnicodeVocab = [];
// for (const byte in byteToUnicode) {
//     byteToUnicodeVocab[parseInt(byte)] = vocab[byteToUnicode[byte]];
// }

// // Additional token mapping of token IDs to unicode values
// const addedTokens = {};
// for (const token of tokenizerConfig['added_tokens']) {
// 	addedTokens[parseInt(token['id'])] = token['content'];
// }

// // Process the added tokens to their vocab representation
// const addedTokensTokensMap = {};
// for (const tokenID in addedTokens) {
// 	addedTokensTokensMap[tokenID] = Buffer.from(addedTokens[tokenID], 'utf-8')
// 	.reduce((result, byte) => {
// 		result.push(byteToUnicodeVocab[byte]);
// 		return result;
// 	}, []); 
// }

// // Ensure the added tokens are in the vocab
// for (const addedTokenId in addedTokens) {
// 	const encodedAddedToken = Buffer.from(addedTokens[addedTokenId], 'utf-8')
// 	.reduce((result, byte) => {
// 		result.push(byteToUnicode[byte]);
// 		return result;
// 	}, []).toString('utf-8');
// 	vocab[encodedAddedToken] = addedTokenId;
// }

// // And the reverse vocab
// const vocabReversed = {};
// for (const content in vocab) {
// 	vocabReversed[parseInt(vocab[content])] = content;
// }

// // // While "Faster", it produces different results from HF's tokenizer
// // // ---
// // // Map varient of the processed merges
// // const processedMergesMap = { 
// // 	// tokenA: { tokenB: tokenMerged }
// // };

// // Precompute the merges vocab token pairs (speed up the encoding)
// const processedMerges = merges.map((merge) => {
// 	const space = merge.indexOf(' ');
// 	if (space === -1) {
// 		throw new Error("Space not found in merge");
// 	}
// 	const tokenA = vocab[merge.slice(0, space)];
// 	const tokenB = vocab[merge.slice(space + 1)];
// 	const tokenMerged = vocab[merge.replace(" ", "")];

// 	// // Add to the processed merges map
// 	// processedMergesMap[tokenA] = processedMergesMap[tokenA] || {};
// 	// processedMergesMap[tokenA][tokenB] = tokenMerged;

// 	return { tokenA, tokenB, tokenMerged };
// });

// // \u0120 special merging (tokenID: 209)
// // For some reason (i dunno), the hugging face tokenizer merges \u0120 with the next token more aggressively then expected
// // So we need to do a special vocab mapping for this
// const u0120Merges = {
// 	// 41497: 35762
// };

// // Find all the vocab tokens that start with \u0120
// for (const content in vocab) {
// 	// Skip anything that does not start with \u0120
// 	if( content.charCodeAt(0) != 0x0120 ) {
// 		continue;
// 	}

// 	// Get the rest of the token content after \u0120
// 	const rest = content.slice(1);

// 	// Skip if the rest is empty
// 	if (rest.length === 0) {
// 		continue;
// 	}

// 	// Get a matching token ID for the rest of the token (if found)
// 	const restTokenID = vocab[rest];
// 	if( restTokenID === undefined ) {
// 		continue;
// 	}

// 	// Lets add it to the u0120Merges
// 	u0120Merges[restTokenID] = vocab[content];
// }

// //----------------------------------
// // Utils
// //----------------------------------

// /**
//  * Replace all occurance of A subequence in the provided list with B.
//  * @param {Array<Int>} lst 
//  * @param {Array<Int>} a 
//  * @param {Array<Int>} b 
//  */
// function replaceSubsequence(lst, a, b) {
// 	for (let i = 0; i < lst.length; i++) {
// 		// Last do an optimized fast fail 
// 		// match for the first number
// 		if (lst[i] !== a[0]) {
// 			continue;
// 		}

// 		// Lets try to match the subsequence
// 		// from 2nd number onwards
// 		let matchFound = true;
// 		for(let j = 0; j < a.length; j++) {
// 			if (lst[i + j] !== a[j]) {
// 				matchFound = false;
// 				break;
// 			}
// 		}

// 		// Skip if no match
// 		if (!matchFound) {
// 			continue;
// 		}

// 		// Replace the subsequence
// 		lst.splice(i, a.length, ...b);
// 	}
// }

// const splitwords_pattern = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;
// function splitWords(s) {
// 	const result = [];
// 	for (const match of s.matchAll(splitwords_pattern)) {
// 		result.push(match[0]);
// 	}
// 	return result;
// }

// function encodeAddedTokens(s) {
// 	const result = [];
	
// 	let remainder = s;
	
// 	while (remainder.length > 0) {
// 		let nearestPos = remainder.length;
// 		let nearestToken = -1;
		
// 		for (const addedTokenId in addedTokens) {
// 			const pos = remainder.indexOf(addedTokens[addedTokenId]);
			
// 			if (pos !== -1 && pos < nearestPos) {
// 				nearestPos = pos;
// 				nearestToken = parseInt(addedTokenId);
// 			}
// 		}
		
// 		if (nearestPos === remainder.length) {
// 			result.push(remainder);
			
// 			break;
// 		}
		
// 		if (nearestPos !== 0) {
// 			result.push(remainder.slice(0, nearestPos));
// 		}
		
// 		result.push(nearestToken);
// 		remainder = remainder.slice(nearestPos + addedTokens[nearestToken].length);
// 	}
	
// 	return result.flat();
// }

// //----------------------------------
// // Encode and decode functions
// //----------------------------------

// /**
//  * Given the input string, encode it into a list of token IDs.
//  * @param {String} s 
//  * @returns {Array<Int>} 
//  */
// function encode(s) {
// 	// Normalize input string
// 	s = s.normalize(tokenizerConfig.normalizer.type);
	
// 	let result = [];
	
// 	const encodedParts = encodeAddedTokens(s);
	
// 	for (const part of encodedParts) {
// 		if (typeof part === 'number') {
// 			result.push(part);
// 		} else if (typeof part === 'string') {
// 			// Get the word tokens
// 			const wordTokens = splitWords(part)

// 			// Iterate each word
// 			for (const word of wordTokens) {
// 				let tokens = Buffer.from(word, 'utf-8')
// 				.reduce((result, byte) => {
// 					result.push(byteToUnicodeVocab[byte]);
// 					return result;
// 				}, []);

// 				for (const addedTokenId in addedTokensTokensMap) {
// 					replaceSubsequence(tokens, addedTokensTokensMap[addedTokenId], [addedTokenId]);
// 				}

// 				for (const mergeObj of processedMerges) {
// 					const { tokenA, tokenB, tokenMerged } = mergeObj;
// 					for (let i = 0; i < tokens.length - 1; i++) {
// 						if (tokens[i] === tokenA && tokens[i + 1] === tokenB) {
// 							tokens[i] = tokenMerged;
// 							tokens.splice(i + 1, 1);
// 							i--;
// 						}
// 					}
// 				}

// 				// While "Faster", it produces different results from HF's tokenizer
// 				// ---
// 				// for(let i = 0; i < tokens.length - 1; i++) {
// 				// 	const tokenA = tokens[i];
// 				// 	const tokenB = tokens[i + 1];

// 				// 	if( processedMergesMap[tokenA] == null ) {
// 				// 		continue;
// 				// 	}

// 				// 	const tokenMerged = processedMergesMap[tokenA][tokenB];
// 				// 	if( tokenMerged ) {
// 				// 		tokens[i] = tokenMerged;
// 				// 		tokens.splice(i + 1, 1);
// 				// 		i--;
// 				// 	}
// 				// }

// 				result.push(...tokens);
// 			}
// 		} else {
// 			throw new Error(`Unknown part type ${typeof part} : ${part}`);
// 		}
// 	}
	
// 	result = result.flat();

// 	// Lets handle u0120 special merging
// 	// this kinda feels hacky, if someone knows a better way please let me know
// 	for(let i = 0; i < result.length - 1; i++) {
// 		if( result[i] == 209 ) {
// 			const nextToken = result[i + 1];
// 			if( u0120Merges[nextToken] ) {
// 				result[i] = u0120Merges[nextToken];
// 				result.splice(i + 1, 1);
// 				i--;
// 			}
// 		}
// 	}

// 	// Return after joining the tokens
// 	return result;
// }

// /**
//  * Given a list of token IDs, decode it into a string.
//  * @param {Array<Int>} tokens 
//  * @returns {String}
//  */
// function decode(tokens) {
// 	let result = [];
	
// 	for (const token of tokens) {
// 		if(token in addedTokens) {
// 			const tokenString = addedTokens[token];
// 			const decodedPart = Array.from(tokenString, (c) => c.charCodeAt(0));
// 			result = result.concat(decodedPart);
// 		} else if(token in vocabReversed) {
// 			const tokenString = vocabReversed[token];
// 			const decodedPart = Array.from(tokenString, (c) => unicodeToBytes[c]);
// 			result = result.concat(decodedPart);
// 		} else {
// 			throw new Error(`Token ${token} not found in vocab`);
// 		}
// 	}
	
// 	return Buffer.from(result).toString('utf-8');
// }

// //----------------------------------
// // Module export
// //----------------------------------
// module.exports = {
// 	encode,
// 	decode
// }