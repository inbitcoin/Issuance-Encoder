# Issuance-Encoder
[![Build Status](https://travis-ci.org/Colored-Coins/Issuance-Encoder.svg?branch=master)](https://travis-ci.org/Colored-Coins/Issuance-Encoder) [![Coverage Status](https://coveralls.io/repos/Colored-Coins/Issuance-Encoder/badge.svg?branch=master)](https://coveralls.io/r/Colored-Coins/Issuance-Encoder?branch=master) [![npm version](https://badge.fury.io/js/cc-issuance-encoder.svg)](http://badge.fury.io/js/cc-issuance-encoder) [![npm version](http://slack.coloredcoins.org/badge.svg)](http://slack.coloredcoins.org)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

Issuance-Encoder provides the encode/decode functions between a Colored Coins issuance Object to buffer

### Installation

```sh
$ npm install cc-issuance-encoder
```


### Encode

Params:



```js


```

Returns a new Buffer holding the encoded issuance.

##### Example:

```js
var issuanceEncoder = require('cc-issuance-encoder')


```

### Decode

Params:

- consume - takes a consumable buffer (You can use [buffer-consumer] like in the example to create one)

Returns a Colored Coins payment Object

##### Example:

```js
var issuanceEncoder = require('cc-issuance-encoder')

```

### Testing

In order to test you need to install [mocha] globaly on your machine

```sh
$ cd /"module-path"/cc-issuance-Encoder
$ mocha
```


License
----

MIT


[mocha]:https://www.npmjs.com/package/mocha
[buffer-consumer]:https://www.npmjs.com/package/buffer-consumer