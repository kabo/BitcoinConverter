var btc_input   = document.getElementById("btc_input");
var usd_value   = document.getElementById("usd_value");
var usd_wrap    = document.getElementById("usd");
var rate_value  = document.getElementById("rate_value");
var spinner     = document.getElementById("spinner");
var unit_symbol = document.getElementById("unit_symbol");
var prefs       = document.getElementById("prefs");
var timeout     = undefined;

prefs.addEventListener('click', function(event) {
	self.port.emit("pleasePrefs");
}, false);

btc_input.addEventListener('keyup', function(event) {
	if (timeout != undefined) {
	 clearTimeout(timeout);
	}
	timeout = setTimeout(function() {
	  timeout = undefined;
	  pleaseConvert();
	}, 300);
}, false);

function pleaseConvert() {
  var val = btc_input.value;
	if (!val.length) {
		usd_value.textContent = "0.00";
		return;
	}
	self.port.emit("pleaseConvert", val);
	usd_wrap.style.display = "none";
	spinner.style.display = "block";
}

self.port.on("newConversion", function(usd){
  console.info("received newConversion with usd=%s, setting usd_value...", usd);
	usd_value.textContent = usd;
		usd_wrap.style.display = "block";
		spinner.style.display = "none";
});
self.port.on("newRate", function(rate){
  console.info("received newRate with rate=%s...", rate);
	rate_value.textContent = rate;
	pleaseConvert();
});
self.port.on("show", function(unit) {
  btc_input.setAttribute("placeholder", unit);
  btc_input.focus();
  unit_symbol.textContent = "mBTC"==unit ? "m฿" : "฿" ;
});