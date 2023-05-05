# Native Node.js tokenizer for RWKV

0 dependency tokenizer for the [RWKV project](https://github.com/BlinkDL/RWKV-LM)

Should also work for [EleutherAI neox](https://github.com/EleutherAI/gpt-neox) and [pythia](https://github.com/EleutherAI/pythia), as they use the same tokenizer

# Setup 

```.bash
npm i rwkv-tokenizer-node
```

# Usage

```.javascript
const tokenizer = require("RWKV-tokenizer-node");

// Encode into token int : [12092, 3645, 2]
const tokens = tokenizer.encode("Hello World!");

// Decode back to "Hello World!"
const decoded = tokenizer.decode(tokens);
```

Its primary purpose is for use in implementing [RWKV-cpp-node](https://github.com/PicoCreator/RWKV-cpp-node) , 
though it could probably be used for other use cases (eg. pure-JS implementaiton of gpt-neox or RWKV)

# What can be improved?

- performance: its kinda disappointing that this is easily 10x slower then the python implementation (which i believe is using the rust library), however this is generally still good enough for most usecases
- Why not use the hugging face library? Sadly the official huggingface tokenizer lib for nodejs is broken : https://github.com/huggingface/tokenizers/issues/911

PS: Anyone who has any ideas on how to improve its performance, while not failing the test suite, is welcomed to do so.

# How to run the test?

```.bash
# This run the sole test file test/tokenizer.test.js
npm run test
```

The python script used to seed the refence data (using huggingface tokenizer) is found at [test/build-test-token-json.py](./test/build-test-token-json.py)
This test includes a very extensive UTF-8 test file covering all major (and many minor) languages

# Designated maintainer

[@picocreator](https://github.com/PicoCreator) - is the current maintainer of the project, ping him on the RWKV discord if you have any questions on this project

# Special thanks & refrences

@saharNooby - which the current implementation is heavily based on

- https://gist.github.com/saharNooby/bb54519a7d3735afb6949825608c00f0

@cztomsik @josephrocca @BlinkDL - for their various implementation, which is used as refence to squash out mismatching encoding with HF implementation.

- https://github.com/cztomsik/ggml-js/blob/main/lib/tokenizers/bpe-tokenizer.js
- https://github.com/josephrocca/rwkv-v4-web
- https://github.com/BlinkDL/ChatRWKV/blob/main/tokenizer/rwkv_tokenizer.py