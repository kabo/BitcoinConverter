var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var Request = require("sdk/request").Request;
var { setTimeout } = require("sdk/timers");
var prefs = require('sdk/simple-prefs');

var exchange_rate        = false;
var exchange_rate_ts     = false;
var exchange_rate_expiry = 120*1000; // 2 min
var units = {
  "BTC": 1,
  "mBTC": 1000
};

var button = ToggleButton({
  id: "btc-button",
  label: "my button",
  icon: {
    "64": "./bitcoin-logo.svg"
  },
  onChange: handleChange
});

var panel = panels.Panel({
  contentURL: "./main.html",
  contentScriptFile: "./ui.js",
  contentStyleFile: "./main.css",
  width: 104,
  height: 100,
  onShow: handleShow,
  onHide: handleHide
});

function handleShow() {
  console.info("handleShow called, calling fetch_exchange_rate...");
  panel.port.emit("show", prefs.prefs['unit']);
	fetch_exchange_rate(false);
}

function handleChange(state) {
  if (state.checked) {
    panel.show({
      position: button
    });
  }
}

function handleHide() {
  button.state('window', {checked: false});
}

prefs.on("unit", function(prefName){
	exchange_rate        = false;
	exchange_rate_ts     = false;
});

var doConvert = function(btc) {
  console.info("doConvert called with btc=%s", btc);
  var usd = (exchange_rate*btc).toFixed(2);
  console.info("%s %s at exchange_rate %s = %s", btc, prefs.prefs['unit'], exchange_rate, usd);
  console.info("emitting newConversion...");
  //setTimeout(function(){
  panel.port.emit("newConversion", usd);
  //}, 1000);
};

panel.port.on("pleaseConvert", function(btc) {
  console.info("received pleaseConvert with btc=%s, calling fetch_exchange_rate...", btc);
  fetch_exchange_rate(doConvert, btc);
});

function fetch_exchange_rate(callback, btc) {
  console.info("fetch_exchange_rate called with btc=%s, checking exchange_rate_ts (%s) ...", btc, exchange_rate_ts);
  console.log("exchange_rate_ts+exchange_rate_expiry: ", exchange_rate_ts+exchange_rate_expiry);
  if (exchange_rate_ts && (exchange_rate_ts < exchange_rate_ts+exchange_rate_expiry)) {
  	console.info("exchange_rate_ts ok, checking if we should call callback...");
  	if (callback) {
  		console.info("calling callback...");
    	return callback(btc);
    }
    return;
  }
  console.info("exchange_rate_ts not ok, fetching new exchange rate...");
  Request({
  	url: "https://www.bitstamp.net/api/ticker/",
  	onComplete: function(response){
  	  exchange_rate    = response.json.last/units[prefs.prefs['unit']];
  		console.info("exchange_rate fetched, set to %s...", exchange_rate);
  	  exchange_rate_ts = Date.now();
  		panel.port.emit("newRate", exchange_rate);
  		console.info("checking if we should call callback...");
  		if (callback) {
  			console.info("calling callback...");
  			callback(btc);
  		}
  	}
  }).get();
}
