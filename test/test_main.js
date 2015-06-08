var ccEncoding = require(__dirname + '/../issuanceEncoder')

describe('Test Issuance decoder', function () {
  it('should return the right decoding', function (done) {
    this.timeout(0)
    var torrentHash = new Buffer(20)
    torrentHash.fill(0)
    torrentHash[3] = 0x23
    torrentHash[4] = 0x2f
    torrentHash[2] = 0xd3
    torrentHash[12] = 0xe3
    torrentHash[19] = 0xa3
    torrentHash[11] = 0x21
    var sha2 = new Buffer(32)
    sha2.fill(0)
    sha2[0] = 0xf3
    sha2[1] = 0x2f
    sha2[12] = 0x23
    sha2[16] = 0xf3
    sha2[30] = 0x2f
    sha2[21] = 0x23
    sha2[11] = 0x2f
    var data = {
      amountOfUnits: 1323200,
      divisibility: 3,
      lockStatus: false,
      protocol: 0x0302, // Error when start with 0
      version: 0x03
    }
    var result = ccEncoding.encode(data, 40)
    console.log(result.codeBuffer.toString('hex'), result.leftover)
    console.log(ccEncoding.decode(result.codeBuffer))

    data.noRules = true
    result = ccEncoding.encode(data, 40)
    console.log(result.codeBuffer.toString('hex'), result.leftover)
    console.log(ccEncoding.decode(result.codeBuffer))

    data.sha2 = sha2
    data.torrentHash = torrentHash
    result = ccEncoding.encode(data, 40)
    console.log(result.codeBuffer.toString('hex'), result.leftover)
    console.log(ccEncoding.decode(result.codeBuffer))

    data.payments = []
    data.payments.push({skip: false, range: false, precent: true, output: 12, amountOfUnits: 3213213})
    result = ccEncoding.encode(data, 40)
    console.log(result.codeBuffer.toString('hex'), result.leftover)
    console.log(ccEncoding.decode(result.codeBuffer))

    data.payments.push({skip: false, range: false, precent: true, output: 1, amountOfUnits: 321321321})
    result = ccEncoding.encode(data, 40)
    console.log(result.codeBuffer.toString('hex'), result.leftover)
    console.log(ccEncoding.decode(result.codeBuffer))

    data.payments.push({skip: true, range: true, precent: true, output: 1032, amountOfUnits: 1})
    result = ccEncoding.encode(data, 40)
    console.log(result.codeBuffer.toString('hex'), result.leftover)
    console.log(ccEncoding.decode(result.codeBuffer))

    data.payments.push({skip: false, range: false, precent: true, output: 20, amountOfUnits: 100000021000})
    result = ccEncoding.encode(data, 40)
    console.log(result.codeBuffer.toString('hex'), result.leftover)
    console.log(ccEncoding.decode(result.codeBuffer))

    data.payments.push({skip: false, range: false, precent: false, output: 0, amountOfUnits: 1})
    data.payments.push({skip: false, range: false, precent: false, output: 1, amountOfUnits: 2})
    data.payments.push({skip: true, range: false, precent: false, output: 2, amountOfUnits: 3})
    data.payments.push({skip: false, range: false, precent: false, output: 3, amountOfUnits: 4})
    data.payments.push({skip: true, range: false, precent: false, output: 4, amountOfUnits: 5})
    data.payments.push({skip: false, range: false, precent: false, output: 5, amountOfUnits: 6})

    result = ccEncoding.encode(data, 40)
    console.log(result.codeBuffer.toString('hex'), result.leftover)
    console.log(ccEncoding.decode(result.codeBuffer))

    delete data.noRules
    data.payments = []
    data.payments.push({skip: false, range: false, precent: true, output: 12, amountOfUnits: 3213213})
    result = ccEncoding.encode(data, 80)
    console.log(result.codeBuffer.toString('hex'), result.leftover)
    console.log(ccEncoding.decode(result.codeBuffer))
    done()
  })

})
