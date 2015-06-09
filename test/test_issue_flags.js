var ccEncoding = require(__dirname + '/../issueFlagsEncoder')
var assert = require('assert')

var consumer = function (buff) {
  var curr = 0
  return function consume (len) {
    return buff.slice(curr, curr += len)
  }
}

describe('Test issue flags encoder', function () {
  it('should return the right decoding', function (done) {
    this.timeout(0)
    var testCase = [
      {divisibility: 0, lockStatus: false},
      {divisibility: 1, lockStatus: false},
      {divisibility: 2, lockStatus: false},
      {divisibility: 3, lockStatus: false},
      {divisibility: 4, lockStatus: false},
      {divisibility: 5, lockStatus: false},
      {divisibility: 6, lockStatus: false},
      {divisibility: 7, lockStatus: false},
      {divisibility: 0, lockStatus: true},
      {divisibility: 1, lockStatus: true},
      {divisibility: 2, lockStatus: true},
      {divisibility: 3, lockStatus: true},
      {divisibility: 4, lockStatus: true},
      {divisibility: 5, lockStatus: true},
      {divisibility: 6, lockStatus: true},
      {divisibility: 7, lockStatus: true}
    ]

    for (var i = 0; i < testCase.length; i++) {
      var code = ccEncoding.encode(testCase[i])
      var decode = ccEncoding.decode(consumer(code))
      console.log(testCase[i].lockStatus)
      console.log(decode.lockStatus)
      assert.equal(testCase[i].divisibility, decode.divisibility, 'Divisibility encode has problems')
      assert.equal(testCase[i].lockStatus, decode.lockStatus, 'LockStatusk encode has problems')
    }

    done()
  })

  it('should fail for wrong input', function (done) {
    this.timeout(0)
    var testCase = [
      {divisibility: 8, lockStatus: true},
      {divisibility: 8, lockStatus: false},
      {divisibility: 82, lockStatus: true},
      {divisibility: 21, lockStatus: false},
      {divisibility: -8, lockStatus: true},
      {divisibility: 0xff, lockStatus: false},
      {divisibility: 1000, lockStatus: true},
      {divisibility: -1, lockStatus: false}
    ]

    for (var i = 0; i < testCase.length; i++) {
      assert.throws(function () {
        ccEncoding.encode(testCase[i])
      }, 'Divisibility not in range'
      , 'Wrong fail')
    }

    done()
  })

})
