module.exports = {
  time: timeString => {
    let time = new Date(timeString)
    return time.getTime()
  },

  format: report => {
    report = JSON.stringify(report)
    return report.replace(/],/g, "],\n")
  },

  formatCSV: report => {
    report = JSON.stringify(report)
    report.replace(/],/g, "],\n")
    return report.replace(/[\[\]']+/g, "")
  }
}
