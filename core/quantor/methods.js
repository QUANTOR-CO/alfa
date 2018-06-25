module.exports = {
  time: timeString => {
    let time = new Date(timeString)
    return time.getTime()
  },

  tableTime: timeString => {
    let time = timeString.split("T")
    return `${time[0]} ${time[1].slice(0,5)}`
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
