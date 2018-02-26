// simple POST request that returns the backtest result

const fs = require("fs")

const _ = require('lodash');
const promisify = require('tiny-promisify');
const pipelineRunner = promisify(require('../../core/workers/pipeline/parent'));

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
  var now = new Date()
  now = now.getTime()
  var fileName = `code${now}`
  fs.writeFileSync("strategies/" + fileName + ".js", code, "utf-8")

  backtestReq = JSON.parse('{"gekkoConfig":{"watch":{"exchange":"gdax","currency":"USD","asset":"BTC"},"paperTrader":{"feeMaker":0.25,"feeTaker":0.25,"feeUsing":"maker","slippage":0.05,"simulationBalance":{"asset":1,"currency":100},"reportRoundtrips":true,"enabled":true},"tradingAdvisor":{"enabled":true,"method":"' + fileName + '","candleSize":60,"historySize":10},"' + fileName + '":{"short":10,"long":21,"signal":9,"thresholds":{"down":-0.025,"up":0.025,"persistence":1}},"backtest":{"daterange":{"from":"2017-01-01T00:35:00Z","to":"2017-02-21T17:35:00Z"}},"performanceAnalyzer":{"riskFreeReturn":2,"enabled":true},"valid":true},"data":{"candleProps":["close","start"],"indicatorResults":true,"report":true,"roundtrips":true,"trades":true}}')

  _.merge(config, base, backtestReq.gekkoConfig);

  var result = yield pipelineRunner(mode, config);

  fs.unlinkSync("strategies/" + fileName + ".js")

  this.body = result;
}