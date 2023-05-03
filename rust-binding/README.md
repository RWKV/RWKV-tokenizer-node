# Rust Binding

The following is rust code, for a simplified wrapper around the huggingface tokenizer library.

This is needed, as the official tokenizers library is currently broken at : https://www.npmjs.com/package/tokenizers
Due to a blocking issue, which prevents a nodejs version upgrade : https://github.com/huggingface/tokenizers/issues/911

As such, instead of trying to port over the whole tokenizer library to node via FFI (hard)
This is an attempt to strictly wrap around with rust code, what we will need, and port that over.

# To setup the rust environment in debian

```
# install rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# install pkg-cofnig
apt install -y pkg-config
```