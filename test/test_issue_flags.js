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
      {div: 0, lock: false},
      {div: 1, lock: false},
      {div: 2, lock: false},
      {div: 3, lock: false},
      {div: 4, lock: false},
      {div: 5, lock: false},
      {div: 6, lock: false},
      {div: 7, lock: false},
      {div: 0, lock: true},
      {div: 1, lock: true},
      {div: 2, lock: true},
      {div: 3, lock: true},
      {div: 4, lock: true},
      {div: 5, lock: true},
      {div: 6, lock: true},
      {div: 7, lock: true}
    ]

    for (var i = 0; i < testCase.length; i++) {
      var code = ccEncoding.encode(testCase[i].div, testCase[i].lock)
      var decode = ccEncoding.decode(consumer(code))
      assert.equal(testCase[i].div, decode.divisibility, 'Div encode has problems')
      assert.equal(testCase[i].lock, decode.lockStatus, 'Lock encode has problems')
    }

    done()
  })

  it('should fail for wrong input', function (done) {
    this.timeout(0)
    var testCase = [
      {div: 8, lock: true},
      {div: 8, lock: false},
      {div: 82, lock: true},
      {div: 21, lock: false},
      {div: -8, lock: true},
      {div: 0xff, lock: false},
      {div: 1000, lock: true},
      {div: -1, lock: false}
    ]

    for (var i = 0; i < testCase.length; i++) {
      assert.throws(function () {
        ccEncoding.encode(testCase[i].div, testCase[i].lock)
      }, 'Divisibility not in range'
      , 'Wrong fail')
    }

    done()
  })

})
