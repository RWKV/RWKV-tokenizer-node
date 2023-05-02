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
const helloWorldTxt = fs.readFileSync(path.resolve(__dirname,"hello-world.txt"), "utf8");
const helloWorldTokens = JSON.parse(fs.readFileSync(path.resolve(__dirname,"hello-world.json"), "utf8"));
const testStringTxt = fs.readFileSync(path.resolve(__dirname,"test-string.txt"), "utf8");
const testStringTokens = JSON.parse(fs.readFileSync(path.resolve(__dirname,"test-string.json"), "utf8"));

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

// Validate the UTF8 test string file
describe("Testing the 'UTF8 stress test' test-string", function() {
	// Set large timeout
	this.timeout(10 * 1000); // 10 seconds

	// // Test basic encoding & decoding
	// it("encode and decode", function() {
	// 	let tokens = tokenizer.encode(testStringTxt);
	// 	assert.ok(tokens.length > 0);

	// 	let decoded = tokenizer.decode(tokens);
	// 	assert.equal(decoded, testStringTokens);
	// });
	
	// Check encoding result
	it("encode result validation", function() {
		let tokens = tokenizer.encode(testStringTxt);
		assert.deepEqual(tokens, helloWorldTokens);
	});
});
