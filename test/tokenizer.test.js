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
const helloWorldTxt = fs.readFileSync(path.resolve(__dirname,"hello-world.txt"), "utf-8");
const helloWorldTokens = JSON.parse(fs.readFileSync(path.resolve(__dirname,"hello-world.json"), "utf-8"));
const testStringTxt = fs.readFileSync(path.resolve(__dirname,"test-string.txt"), "utf-8");
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
});

// Testing of UTF8 jap chars
describe("Testing sample of japnese characters", function() {
	// Set large timeout
	this.timeout(10 * 1000); // 10 seconds

	// The sample
	const sample = '起業家イーロン・マスク氏が創業した宇宙開発企業「スペースX（エックス）」の巨大新型ロケット「スターシップ」が20日朝、初めて打ち上げられたが、爆発した。';

	// Test basic encoding & decoding
	it("encode and decode", function() {
		let tokens = tokenizer.encode(sample);
		assert.ok(tokens.length > 0);

		let decoded = tokenizer.decode(tokens);
		assert.equal(decoded, sample);
	});
});

// // Validate the UTF8 test string file
// describe("Testing the 'UTF8 stress test' test-string", function() {
// 	// Set large timeout
// 	this.timeout(10 * 1000); // 10 seconds

// 	// Test basic encoding & decoding
// 	it("encode and decode (line by line)", function() {
// 		let lines = testStringTxt.split("\n");
// 		for (let i = 0; i < lines.length; i++) {
// 			let tokens = tokenizer.encode(lines[i]+"\n");
// 			assert.ok(tokens.length > 0, `Line ${i} encoding failed with : ${lines[i]}`);

// 			let decoded = tokenizer.decode(tokens);
// 			assert.equal(decoded, lines[i]+"\n", `Line ${i} decoding failed with : ${lines[i]}`);
// 		}
// 	});

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
// });
