//-----------------------------------------------------------
// Setup chai assertion
//-----------------------------------------------------------
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;

//-----------------------------------------------------------
// Load dependencies
//-----------------------------------------------------------

// NodeJS dependencies
const path = require("path");
const fs = require("fs");

// Implementation
const tokenizer = require("../src/tokenizer");

// Test data and expected result
//
// Note that .normalize("NFC") is required to get the same result as the python implementation
// for the current tokenizer model
const helloWorldTxt = fs.readFileSync(path.resolve(__dirname,"hello-world.txt"), "utf-8").normalize("NFC");
const helloWorldTokens = JSON.parse(fs.readFileSync(path.resolve(__dirname,"hello-world.json"), "utf-8"));
const testStringTxt = fs.readFileSync(path.resolve(__dirname,"test-string.txt"), "utf-8").normalize("NFC");
const testStringTokens = JSON.parse(fs.readFileSync(path.resolve(__dirname,"test-string.json"), "utf-8"));
const testStringTokensLines = JSON.parse(fs.readFileSync(path.resolve(__dirname,"test-string-lines.json"), "utf-8"));

//-----------------------------------------------------------
// And perform the unit tests
//-----------------------------------------------------------

// Validate the hello world file
describe("Testing the 'Hello World!' example", function() {
	// Set large timeout
	this.timeout(10 * 1000); // 10 seconds

	// Test basic encoding & decoding
	it("encode and decode", function() {
		let tokens = tokenizer.encode(helloWorldTxt);
		assert.ok(tokens.length > 0);

		let decoded = tokenizer.decode(tokens);
		assert.equal(decoded, helloWorldTxt);
	});
	
	// Check encoding result
	it("encode result validation", function() {
		let tokens = tokenizer.encode(helloWorldTxt);
		assert.deepEqual(tokens, helloWorldTokens);
	});

	// Test decoding
	it("decode testing", function() {
		let decoded = tokenizer.decode(helloWorldTokens);
		assert.equal(decoded, helloWorldTxt);
	});

});

// Testing of UTF8 jap chars
describe("Testing sample of JAP characters", function() {
	// Set large timeout
	this.timeout(10 * 1000); // 10 seconds

	// The sample
	const sample = '起業家イーロン・マスク氏が創業した宇宙開発企業「スペースX（エックス）」の巨大新型ロケット「スターシップ」が20日朝、初めて打ち上げられたが、爆発した。'.normalize("NFC");

	// Test basic encoding & decoding
	it("encode and decode", function() {
		let tokens = tokenizer.encode(sample);
		assert.ok(tokens.length > 0);

		let decoded = tokenizer.decode(tokens);
		assert.equal(decoded, sample);
	});
});

// Testing of UTF8 jap chars
describe("Testing sample of whitespace characters", function() {
	// Set large timeout
	this.timeout(10 * 1000); // 10 seconds

	// The sample
	const sample = '< LOTS OF SPACE >                                                                                                                              < YO >'.normalize("NFC");

	// Test basic encoding & decoding
	it("encode and decode", function() {
		let tokens = tokenizer.encode(sample);
		assert.ok(tokens.length > 0);

		let decoded = tokenizer.decode(tokens);
		assert.equal(decoded, sample);
	});
});

// Validate the UTF8 test string file
describe("Testing the 'UTF8 stress test' test-string", function() {
	// Set large timeout
	this.timeout(600 * 1000); // 600 seconds

	// Test decoding
	it("decode testing", function() {
		// Get the decoded str
		let decoded = tokenizer.decode(testStringTokens);
		
		// Lets validate line bye line
		let decodedSplit = decoded.split("\n");
		let lines = testStringTxt.split("\n");
		
		// Check number of lines
		assert.equal(decodedSplit.length, lines.length);

		// Check each line
		for (let i = 0; i < lines.length; i++) {
			if( decodedSplit[i].normalize("NFC") !== lines[i].normalize("NFC") ) {
				console.log(`validation failed on line ${i}`);
				console.log(`decodedSplit[i] : ${decodedSplit[i]}`);
				console.log(`lines[i]        : ${lines[i]}`);
			}
			assert.equal(decodedSplit[i].normalize("NFC"), lines[i].normalize("NFC"), `validation failed on line ${i}`);
		}
	});

	// Test full encoding & decoding
	it("encode and decode (line by line)", function() {
		let lines = testStringTxt.split("\n");
		for (let i = 0; i < lines.length; i++) {
			// Get the encoded tokens
			let tokens = tokenizer.encode(lines[i]+"\n");
			assert.ok(tokens.length > 0, `Line ${i} encoding failed with : ${lines[i]}`);

			// Decode it back
			let decoded = tokenizer.decode(tokens);

			// Log if it failed
			if( lines[i]+"\n" !== decoded ) {
				console.log(`validation failed on line ${i}`);
				console.log(`line    : ${lines[i]}`);
				console.log(`decoded : ${decoded}`);
				console.log(`tokens  : ${tokens}`);
			}

			// Assert accordingly
			assert.equal(decoded, lines[i]+"\n", `Line ${i} decoding failed with : ${lines[i]}`);
		}
	});

	// Encode and validate line by line
	it("encode and validate (line by line)", function() {
		let lines = testStringTxt.split("\n");

		//
		// The following are known tricky lines
		// Line 531 - Sanskrit: काचं शक्नोम्यत्तुम् । नोपहिनस्ति माम् ॥
		// Line 698 - Nepali: म काँच खान सक्छू र मलाई केहि नी हुन्‍न् ।
		//
		for (let i = 0; i < lines.length; i++) {
			// Skip empty lines
			if( lines[i] === "" ) continue;

			// Get the encoded tokens
			let tokens = tokenizer.encode(lines[i]);
			assert.ok(tokens.length > 0, `Line ${i} encoding failed with : ${lines[i]}`);

			// Get the reference tokens
			let refTokens = testStringTokensLines[i];

			// And validate
			assert.deepEqual(tokens, refTokens, `Line ${i} decoding failed with : ${lines[i]}`);
		}
	});

	it("encode and decode (full)", function() {
		let tokens = tokenizer.encode(testStringTxt);
		assert.ok(tokens.length > 0);

		let decoded = tokenizer.decode(tokens);
		assert.equal(decoded, testStringTxt);
	});
	
	// Check encoding result
	// This currently fails for some reason?
	//
	// Expected result is 19,339 tokens
	// while the encoding is 19,341 tokens
	//
	// This is despite passing the line by line test
	it("encode and validate", function() {
		let tokens = tokenizer.encode(testStringTxt);
		// assert.deepEqual(tokens, testStringTokens);
		for(let i=0; i<testStringTokens.length; i++) {
			assert.equal(tokens[i], testStringTokens[i], `Token ${i} failed, expected ${testStringTokens[i]} but got ${tokens[i]}}`);
		}
		assert.deepEqual(tokens, testStringTokens);
	});
});
