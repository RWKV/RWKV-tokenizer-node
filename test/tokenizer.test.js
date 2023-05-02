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

// Validate the UTF8 test string file
describe("Testing the 'UTF8 stress test' test-string", function() {
	// Set large timeout
	this.timeout(10 * 1000); // 10 seconds

	// // Test decoding
	// it("decode testing", function() {
	// 	// Get the decoded str
	// 	let decoded = tokenizer.decode(testStringTokens);
		
	// 	// Lets validate line bye line
	// 	let decodedSplit = decoded.split("\n");
	// 	let lines = testStringTxt.split("\n");
		
	// 	// Check number of lines
	// 	assert.equal(decodedSplit.length, lines.length);

	// 	// Check each line
	// 	for (let i = 0; i < lines.length; i++) {
	// 		if( decodedSplit[i] !== lines[i] ) {
	// 			console.log(`validation failed on line ${i}`);
	// 			console.log(`decodedSplit[i] : ${decodedSplit[i]}`);
	// 			console.log(`lines[i]        : ${lines[i]}`);
	// 		}

	// 		// assert.equal(decodedSplit[i].normalize("NFC"), lines[i].normalize("NFC"), `validation failed on line ${i}`);
	// 	}
	// });

	// Test basic encoding & decoding
	it("encode and decode (line by line)", function() {
		let lines = testStringTxt.split("\n");
		for (let i = 0; i < lines.length; i++) {
			let tokens = tokenizer.encode(lines[i]+"\n");
			assert.ok(tokens.length > 0, `Line ${i} encoding failed with : ${lines[i]}`);

			let decoded = tokenizer.decode(tokens);

			if( lines[i].indexOf("Here come the tests:") > -1 ) {
				console.log(`validation failed on line ${i}`);
				console.log(`line    : ${lines[i]}`);
				console.log(`decoded : ${decoded}`);
				console.log(`tokens  : ${tokens}`);
			}

			assert.equal(decoded, lines[i]+"\n", `Line ${i} decoding failed with : ${lines[i]}`);
		}
	});

// 	// it("encode and decode", function() {
// 	// 	let tokens = tokenizer.encode(testStringTxt);
// 	// 	assert.ok(tokens.length > 0);

// 	// 	let decoded = tokenizer.decode(tokens);
// 	// 	assert.equal(decoded, testStringTokens);
// 	// });
	
// 	// // Check encoding result
// 	// it("encode result validation", function() {
// 	// 	let tokens = tokenizer.encode(testStringTxt);
// 	// 	assert.deepEqual(tokens, testStringTokens);
// 	// });
});
