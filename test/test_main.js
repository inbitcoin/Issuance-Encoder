var ccEncoding = require(__dirname + '/../issuanceEncoder')
var assert = require('assert')

var consumer = function (buff) {
  var curr = 0
  return function consume (len) {
    return buff.slice(curr, curr += len)
  }
}

var toBuffer = function (val) {
  val = val.toString(16)
  if (val.length % 2 == 1) {
    val = '0'+val
  }
  return new Buffer(val, 'hex')
}

describe('80 byte OP_RETURN', function() {

  var code
  var decoded
  var torrentHash = new Buffer('46b7e0d000d69330ac1caa48c6559763828762e1', 'hex')
  var sha2 = new Buffer('03ffdf3d6790a21c5fc97a62fe1abc5f66922d7dee3725261ce02e86f078d190', 'hex')
  var data = {
    amount: 15,
    divisibility: 2,
    lockStatus: false,
    protocol: 0x4343, // Error when start with 0
    version: 0x02,
    lockStatus: true,
    payments: []
  }
  data.payments.push({skip: false, range: false, percent: false, output: 1, amount: 15})

  it('Issuance OP_CODE 0x06 - No Metadata, can add rules', function (done) {
    this.timeout(0)

    code = ccEncoding.encode(data, 80)

    console.log(code.codeBuffer.toString('hex'), code.leftover)
    var consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
    assert.deepEqual(toBuffer('4343'), consume(2))
    assert.deepEqual(toBuffer('02'), consume(1))  //version
    assert.deepEqual(toBuffer('06'), consume(1))  //issuance OP_CODE
    assert.deepEqual(toBuffer('0f'), consume(1))  //issue amount
    assert.deepEqual(toBuffer('010f'), consume(2))  //payments
    assert.deepEqual(toBuffer('50'), consume(1))  //divisibility + lockstatus + reserved bits currently 0

    decoded = ccEncoding.decode(code.codeBuffer)
    console.log(decoded)

    assert.equal(decoded.amount, data.amount)
    assert.equal(decoded.divisibility, data.divisibility)
    assert.equal(decoded.lockStatus, data.lockStatus)
    assert.equal(decoded.protocol, data.protocol)
    assert.deepEqual(decoded.payments, data.payments)
    assert.deepEqual(decoded.multiSig, code.leftover)
    assert.equal(decoded.noRules, false)
    done()
  })


  it('Issuance OP_CODE 0x05 - No Metadata, cannot add rules', function (done) {
    this.timeout(0)

    data.noRules = true

    code = ccEncoding.encode(data, 80)
    console.log(code.codeBuffer.toString('hex'), code.leftover)

    var consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
    assert.deepEqual(toBuffer('4343'), consume(2))
    assert.deepEqual(toBuffer('02'), consume(1))  //version
    assert.deepEqual(toBuffer('05'), consume(1))  //issuance OP_CODE 
    assert.deepEqual(toBuffer('0f'), consume(1))  //issue amount
    assert.deepEqual(toBuffer('010f'), consume(2))  //payments
    assert.deepEqual(toBuffer('50'), consume(1))  //divisibility + lockstatus + reserved bits currently 0

    decoded = ccEncoding.decode(code.codeBuffer)
    console.log(decoded)

    assert.equal(decoded.amount, data.amount)
    assert.equal(decoded.divisibility, data.divisibility)
    assert.equal(decoded.lockStatus, data.lockStatus)
    assert.equal(decoded.protocol, data.protocol)
    assert.deepEqual(decoded.payments, data.payments)
    assert.deepEqual(decoded.multiSig, code.leftover)
    assert.equal(decoded.noRules, true)

    data.torrentHash = torrentHash
    done()
  })

  it('Issuance OP_CODE 0x04 - SHA1 Torrent Hash in OP_RETURN, No SHA256 of Metadata', function (done) {
    this.timeout(0)

    data.torrentHash = torrentHash

    code = ccEncoding.encode(data, 80)
    console.log(code.codeBuffer.toString('hex'), code.leftover)

    var consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
    assert.deepEqual(toBuffer('4343'), consume(2))
    assert.deepEqual(toBuffer('02'), consume(1))  //version
    assert.deepEqual(toBuffer('04'), consume(1))  //issuance OP_CODE
    assert.deepEqual(toBuffer('46b7e0d000d69330ac1caa48c6559763828762e1'), consume(20))   //torrent hash
    assert.deepEqual(toBuffer('0f'), consume(1))  //issue amount
    assert.deepEqual(toBuffer('010f'), consume(2))  //payments
    assert.deepEqual(toBuffer('50'), consume(1))  //divisibility + lockstatus + reserved bits currently 0

    decoded = ccEncoding.decode(code.codeBuffer)
    console.log(decoded)

    assert.equal(decoded.amount, data.amount)
    assert.equal(decoded.divisibility, data.divisibility)
    assert.equal(decoded.lockStatus, data.lockStatus)
    assert.equal(decoded.protocol, data.protocol)
    assert.equal(decoded.lockstatus, data.lockstatus)
    assert.deepEqual(decoded.payments, data.payments)
    assert.deepEqual(decoded.multiSig, code.leftover)
    assert.deepEqual(decoded.torrentHash, torrentHash)

    data.torrentHash = torrentHash
    done()
  })

  it('Issuance OP_CODE 0x01 - SHA1 Torrent Hash + SHA256 of metadata in 80 bytes', function (done) {
    this.timeout(0)

    //pushing payments to the limit.
    data.payments = []
    for (var i = 0 ; i < 11 ; i++) {
      data.payments.push({skip: false, range: false, percent: false, output: 1, amount: 1})
    }

    data.torrentHash = torrentHash
    data.sha2 = sha2

    code = ccEncoding.encode(data, 80)
    console.log(code.codeBuffer.toString('hex'), code.leftover)

    var consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
    assert.deepEqual(toBuffer('4343'), consume(2))
    assert.deepEqual(toBuffer('02'), consume(1))  //version
    assert.deepEqual(toBuffer('01'), consume(1))  //issuance OP_CODE
    assert.deepEqual(toBuffer('46b7e0d000d69330ac1caa48c6559763828762e1'), consume(20))   //torrent hash
    assert.deepEqual(toBuffer('03ffdf3d6790a21c5fc97a62fe1abc5f66922d7dee3725261ce02e86f078d190'), consume(32))   //metadata sha2
    assert.deepEqual(toBuffer('0f'), consume(1))  //issue amount
    for (var i = 0 ; i < data.payments.length ; i++) {
      assert.deepEqual(toBuffer('0101'), consume(2))    //payment
    }
    assert.deepEqual(toBuffer('50'), consume(1))  //divisibility + lockstatus + reserved bits currently 0

    decoded = ccEncoding.decode(code.codeBuffer)
    console.log(decoded)

    assert.equal(decoded.amount, data.amount)
    assert.equal(decoded.divisibility, data.divisibility)
    assert.equal(decoded.lockStatus, data.lockStatus)
    assert.equal(decoded.protocol, data.protocol)
    assert.equal(decoded.lockstatus, data.lockstatus)
    assert.deepEqual(decoded.payments, data.payments)
    assert.deepEqual(decoded.multiSig, code.leftover)
    assert.deepEqual(decoded.torrentHash, torrentHash)
    assert.deepEqual(decoded.sha2, sha2)

    data.torrentHash = torrentHash
    done()
  })

  it('Issuance OP_CODE 0x02 - SHA1 Torrent Hash in OP_RETURN, SHA256 of metadata in 1(2) multisig', function (done) {
    this.timeout(0)

    //After previous test, one more will exceed 80 byte.
    data.payments.push({skip: false, range: false, percent: false, output: 1, amount: 1})

    data.torrentHash = torrentHash
    data.sha2 = sha2

    code = ccEncoding.encode(data, 80)
    console.log(code.codeBuffer.toString('hex'), code.leftover)

    var consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
    assert.deepEqual(toBuffer('4343'), consume(2))
    assert.deepEqual(toBuffer('02'), consume(1))  //version
    assert.deepEqual(toBuffer('02'), consume(1))  //issuance OP_CODE
    assert.deepEqual(toBuffer('46b7e0d000d69330ac1caa48c6559763828762e1'), consume(20))   //torrent hash
    assert.deepEqual(toBuffer('0f'), consume(1))  //issue amount
    for (var i = 0 ; i < data.payments.length ; i++) {
      assert.deepEqual(toBuffer('0101'), consume(2))    //payment
    }
    assert.deepEqual(toBuffer('50'), consume(1))  //divisibility + lockstatus + reserved bits currently 0

    decoded = ccEncoding.decode(code.codeBuffer)
    console.log(decoded)

    assert.equal(decoded.amount, data.amount)
    assert.equal(decoded.divisibility, data.divisibility)
    assert.equal(decoded.lockStatus, data.lockStatus)
    assert.equal(decoded.protocol, data.protocol)
    assert.equal(decoded.lockstatus, data.lockstatus)
    assert.deepEqual(decoded.payments, data.payments)
    assert.equal(decoded.multiSig.length, 1)
    assert.equal(decoded.multiSig.length, code.leftover.length)
    assert.deepEqual(decoded.multiSig[0], { hashType: 'sha2', index: 1 })
    assert.deepEqual(code.leftover[0], sha2)
    assert.deepEqual(decoded.torrentHash, torrentHash)

    data.torrentHash = torrentHash
    done()
  })

  it('Issuance OP_CODE 0x03 - SHA1 Torrent Hash + SHA256 of metadata in 1(3) multisig', function (done) {
    this.timeout(0)

    //20 more bytes for transfer instructions - push torrent hash out
    for (var i = 0 ; i < 20 ; i++) {
      data.payments.push({skip: false, range: false, percent: false, output: 1, amount: 1})
    }

    data.torrentHash = torrentHash
    data.sha2 = sha2

    code = ccEncoding.encode(data, 80)
    console.log(code.codeBuffer.toString('hex'), code.leftover)

    var consume = consumer(code.codeBuffer.slice(0, code.codeBuffer.length))
    assert.deepEqual(toBuffer('4343'), consume(2))
    assert.deepEqual(toBuffer('02'), consume(1))  //version
    assert.deepEqual(toBuffer('03'), consume(1))  //issuance OP_CODE
    assert.deepEqual(toBuffer('0f'), consume(1))  //issue amount
    for (var i = 0 ; i < data.payments.length ; i++) {
      assert.deepEqual(toBuffer('0101'), consume(2))    //payment
    }
    assert.deepEqual(toBuffer('50'), consume(1))  //divisibility + lockstatus + reserved bits currently 0

    decoded = ccEncoding.decode(code.codeBuffer)
    console.log(decoded)

    assert.equal(decoded.amount, data.amount)
    assert.equal(decoded.divisibility, data.divisibility)
    assert.equal(decoded.lockStatus, data.lockStatus)
    assert.equal(decoded.protocol, data.protocol)
    assert.equal(decoded.lockstatus, data.lockstatus)
    assert.deepEqual(decoded.payments, data.payments)
    assert.equal(decoded.multiSig.length, 2)
    assert.equal(decoded.multiSig.length, code.leftover.length)
    assert.deepEqual(decoded.multiSig[0], { hashType: 'sha2', index: 1 })
    assert.deepEqual(decoded.multiSig[1], { hashType: 'torrentHash', index: 2 })
    assert.deepEqual(code.leftover[1], sha2)
    assert.deepEqual(code.leftover[0], torrentHash)

    data.torrentHash = torrentHash
    done()
  })
})
