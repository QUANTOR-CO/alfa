// simple POST request that returns the backtest result

const quantorTest = require("../../core/quantor/test")

const _ = require('lodash');
const promisify = require('tiny-promisify');
const pipelineRunner = promisify(require('../../core/workers/pipeline/parent'));
const toml = require('toml');

const format_date = function(line) {
  return line.split(' ').join('T') + ":00Z"
}

// starts a backtest
// requires a post body like:
//
// {
//   gekkoConfig: {watch: {exchange: "poloniex", currency: "USDT", asset: "BTC"},…},…}
//   data: {
//     candleProps: ["close", "start"],
//     indicatorResults: true,
//     report: true,
//     roundtrips: true
//   }
// }

module.exports = function *() {
  var mode = 'backtest';
  var config = {};
  var base = require('./baseConfig');

  var req = this.request.body;
  var code = req.code
  code = code.replace(/;\/rn;/g, "\r\n")
  code = code.replace(/;\/t;/g, "\t")

  var testReport = quantorTest.perform(code, false)

  if (typeof(testReport.ok) != "string") {
    this.body = testReport
    return
  }

  var fileName = testReport.name
  var settings = toml.parse(req.settings)
  var paper = toml.parse(req.paper)
  paper.reportRoundtrips = true
  paper.enabled = true
  var fromTime = format_date(req.from)
  var toTime = format_date(req.to)
  var backtestReq = {
    gekkoConfig: {
      watch: {
        exchange: req.exchange,
        currency: req.currency,
        asset: req.asset
      },
      paperTrader: paper,
      tradingAdvisor: {
        enabled: true,
        method: fileName,
        candleSize: req.candle_size,
        historySize: 10
      },
      backtest: {
        daterange: {
          from: fromTime,
          to: toTime
        }
      },
      performanceAnalyzer: {
        riskFreeReturn: 2,
        enabled: true
      },
      valid: true
    },
    data: {
      candleProps: [ "close", "start"],
      indicatorResults: true,
      report: true,
      roundtrips: true,
      trades: true
    }
  }
  backtestReq.gekkoConfig[fileName] = settings

  _.merge(config, base, backtestReq.gekkoConfig);

  var result = yield pipelineRunner(mode, config);

  quantorTest.remove(fileName)

  this.body = result;
}