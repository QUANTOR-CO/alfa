const quantorTest = require("../../core/quantor/test")

module.exports = function *() {
  console.log(this.request)
  var req = this.request.body
  var code = req.code
  console.log(code)
  code = code.replace(/;\/rn;/g, "\r\n")
  code = code.replace(/;\/t;/g, "\t")

  var report = quantorTest.perform(code)

  this.body = report
}
