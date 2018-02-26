let m = require("./quantorMethods")

module.exports = {
  trades: tradesList => {
    var report = []
    tradesList.forEach( trade => {
      var time = new Date(trade.date)
      report.push([time.getTime(), trade.balance])
    })
    return report
  },
  roundtrips: roundtripsList => {
    var report = []
    var start = roundtripsList[0]
    report.push([m.time(start.entryAt), start.entryBalance ])
    roundtripsList.forEach( roundtrip => {
      report.push([ m.time(roundtrip.exitAt),roundtrip.exitBalance ])
    })
    return report
  }
}
