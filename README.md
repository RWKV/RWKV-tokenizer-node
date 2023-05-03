# Native Node.js tokenizer for RWKV

0 dependency tokenizer for the RWKV project

# Setup 

```
npm install https://github.com/PicoCreator/RWKV-tokenizer-node.git
```

# Usage

```
const tokenizer = require("RWKV-tokenizer-node");

// Encode into token int : [12092, 3645, 2]
const tokens = tokenizer.encode("Hello World!");

// Decode back to "Hello World!"
const deocded = tokenizer.decode(tokens);
```

# Things to do

- [ ] NPM repo publishing
- [ ] Add sampling given the logit state (for inference with RWKV.cpp)

# What can be improved?

**performance** - its kinda disappointing that this is easily 10x slower then the python implementation (which i believe is using the rust library)

However because the official huggingface tokenizer lib for nodejs is broken : https://github.com/huggingface/tokenizers/issues/911
This is the best I can do for now =|

Anyone who has any ideas on how to improve its performance, while not failing the test suite, is welcomed to do so.

# How to run the test?

```
# This run the sole test file test/tokenizer.test.js
npm run test
```

The python script used to seed the refence data (using huggingface tokenizer) is found at [test/build-test-token-json.py](./test/build-test-token-json.py)