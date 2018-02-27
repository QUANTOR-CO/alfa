const fs = require("fs")

const allowed = [ '~lodash~', '~../core/log.js~', '~./indicators/RSI.js~', '~./indicators/TSI.js~', '~./indicators/UO.js~', '~../core/util~' ]
const methods = [ 'init', 'log', 'check', 'update' ]

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

const removeFile = name => {
  fs.unlinkSync("strategies/" + name + ".js")
}

const checkJSModule = (code, test) => {
  var now = new Date()
  now = now.getTime()
  var fileName = `code${now}`

  fs.writeFileSync("strategies/" + fileName + ".js", code, "utf-8")
  try {
    var codeModule = require("../../strategies/" + fileName)
  } catch(e) {
    var codeModule = null
  }
  if (!codeModule) {
    removeFile(fileName)
    return { error: "Failing JS module submitted" }
  }

  if (typeof(codeModule) != "object") {
    removeFile(fileName)
    return { error: "Module should export object" }
  }

  var stopMethodList = []
  var moduleKeys = Object.keys(codeModule)
  moduleKeys.forEach(key => {
    if (methods.indexOf(key) == -1) stopMethodList.push(key)
  })
  if (stopMethodList.length > 0) {
    removeFile(fileName)
    return { forbiddenMethods: stopMethodList }
  }

  var missingMethods = []
  methods.forEach(method => {
    if (typeof(codeModule[method]) != "function") missingMethods.push(method)
  })
  if (missingMethods.length > 0) {
    removeFile(fileName)
    return { missingMethods: missingMethods }
  } 

  if (test) {
    removeFile(fileName)
    return {ok: "Tests passed"}
  }
  return {ok: "Tests passed",
          name: fileName}
}

module.exports = {
  perform: (code, test = true) => {
    stopRequireList = checkRequireList(code)
    if (stopRequireList.length > 0) return { forbiddenRequires: stopRequireList }
    return checkJSModule(code, test)
  },

  remove: removeFile
}
