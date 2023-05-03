#
# This script should be executed inside the test folder
#
# You will need to install the "transformers" library to run this script, with either
#   pip3 install transformers
# or
#   pip install transformers
#
# This script will generate a JSON file containing the tokenized version of
# of the `hello-world.txt` and `test-string.txt` files.  The JSON file will
# contain the array of tokens. Which would be used as reference for other
# tokenizer implementations (ie. JavaScript).
#

# Get the tokenizer from the transformers library
from transformers import PreTrainedTokenizerFast
theTokenizer = PreTrainedTokenizerFast(tokenizer_file="../20B_tokenizer.json")

# Read the test files
with open("hello-world.txt", "r") as f:
    helloWorldStr = f.read()

with open("test-string.txt", "r") as f:
    testStringStr = f.read()

# Tokenize and encode the strings
helloWorldTokens = theTokenizer.encode(helloWorldStr)
testStringTokens = theTokenizer.encode(testStringStr)

# Write the tokens to a JSON file
import json
with open("hello-world.json", "w") as f:
    json.dump(helloWorldTokens, f)

with open("test-string.json", "w") as f:
    json.dump(testStringTokens, f)

# Lets build a varient of testStringStr test, but is done line by line
# and the lines are tokenized and encoded separately
testStringLines = testStringStr.splitlines()

# Tokenize and encode the lines seperately, and build an array of arrays
testStringLinesTokens = []
for line in testStringLines:
    testStringLinesTokens.append(theTokenizer.encode(line))

# Write the tokens to a JSON file
with open("test-string-lines.json", "w") as f:
    json.dump(testStringLinesTokens, f)
