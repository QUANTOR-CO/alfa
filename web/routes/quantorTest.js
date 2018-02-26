const fs = require("fs")

const allowed = [ '~lodash~', '~../core/log.js~', '~./indicators/RSI.js~', '~./indicators/TSI.js~', '~./indicators/UO.js~', '~../core/util~' ]
const methods = [ 'init', 'log', 'check', 'update' ]

const performTest = code => {
  stopRequireList = checkRequireList(code)
  if(stopRequireList.length > 0) return { forbiddenRequires: stopRequireList }
  return checkJSModule(code)
}

const checkRequireList = code => {
  var requireList = code.match(/require\(([^)]+)\)/g) || []
  requireList = requireList.map(entry => {
    entry = entry.replace(/require\(/g, "")
    return entry.replace(/[)'"]+/g, "~")
  })
  var stopRequireList = []
  requireList.forEach(entry => {
    if (allowed.indexOf(entry) == -1) stopRequireList.push(entry)
  })
  return stopRequireList
}

const checkJSModule = code => {
  var now = new Date()
  now = now.getTime()
  var fileName = `strategies/code${now}`

  fs.writeFileSync(fileName + ".js", code, "utf-8")
  try {
    var codeModule = require("../../" + fileName)
  } catch(e) {
    var codeModule = null
  }
  if (!codeModule) return { error: "Failing JS module submitted" }
  if (typeof(codeModule) != "object") return { error: "Module should export object" }

  var stopMethodList = []
  var moduleKeys = Object.keys(codeModule)
  moduleKeys.forEach(key => {
    if (methods.indexOf(key) == -1) stopMethodList.push(key)
  })
  if (stopMethodList.length > 0) return { forbiddenMethods: stopMethodList }

  var missingMethods = []
  methods.forEach(method => {
    if (typeof(codeModule[method]) != "function") missingMethods.push(method)
  })
  if (missingMethods.length > 0) return { missingMethods: missingMethods }
  fs.unlinkSync(fileName + ".js")
  return {ok: "Tests passed"}
}

module.exports = function *() {
  var req = this.request.body
  var code = req.code

  var report = performTest(code)
  console.log(report)

  this.body = {
    status: "Ok",
    code: report
  }

}
