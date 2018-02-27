const quantorTest = require("../../core/quantor/test")

module.exports = function *() {
  var req = this.request.body
  var code = req.code

  var report = quantorTest.perform(code)

  this.body = {
    status: "Ok",
    code: report
  }
}
