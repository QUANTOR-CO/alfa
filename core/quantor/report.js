let m = require("./methods")

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
    var report = {
      graph: [],
      table: []
    }
    if (roundtripsList.length == 0) return report
    var start = roundtripsList[0]
    report.graph.push([m.time(start.entryAt), start.entryBalance ])
    roundtripsList.forEach( roundtrip => {
      console.log(roundtrip)
      report.graph.push([ m.time(roundtrip.exitAt),roundtrip.exitBalance ])
      report.table.push([ m.tableTime(roundtrip.entryAt), m.tableTime(roundtrip.exitAt), roundtrip.duration, roundtrip.entryBalance, roundtrip.exitBalance, roundtrip.pnl, roundtrip.profit ])
    })
    return report
  }
}
