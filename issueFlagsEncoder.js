var padLeadingZeros = function (hex, byteSize) {
  return (hex.length === byteSize * 2) && hex || padLeadingZeros('0' + hex, byteSize)
}

module.exports = {
  encode: function (flags) {
    var divisibility = flags.divisibility || 0
    var lockStatus = flags.lockStatus || false
    if (divisibility < 0 || divisibility > 7) throw new Error('Divisibility not in range')
    var result = (divisibility * 2)
    var lockStatusFlag = 0
    lockStatus && (lockStatusFlag = 1)
    result = result | lockStatusFlag
    result = result * Math.pow(2, 4)
    result = padLeadingZeros(result.toString(16), 1)
    return new Buffer(result, 'hex')
  },

  decode: function (consume) {
    var number = consume(1)[0]
    number = (number / 16).toFixed(0)
    var lockStatus = number & 1
    var divisibility = (number & (~1)) / 2
    return {divisibility: divisibility, lockStatus: lockStatus}
  }
}
