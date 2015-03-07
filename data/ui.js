var btc_input  = document.getElementById("btc_input");
var usd_value  = document.getElementById("usd_value");
var usd_wrap   = document.getElementById("usd");
var rate_value = document.getElementById("rate_value");
var spinner    = document.getElementById("spinner");
var timeout    = undefined;

btc_input.addEventListener('keyup', function onkeyup(event) {
  var val = btc_input.value;
	if (timeout != undefined) {
	 clearTimeout(timeout);
	}
	timeout = setTimeout(function() {
	  timeout = undefined;
		if (!val.length) {
			usd_value.textContent = "0.00";
			return;
		}
		self.port.emit("pleaseConvert", val);
		usd_wrap.style.display = "none";
		spinner.style.display = "block";
	}, 300);
}, false);

self.port.on("newConversion", function(usd){
  console.info("received newConversion with usd=%s, setting usd_value...", usd);
	usd_value.textContent = usd;
		usd_wrap.style.display = "block";
		spinner.style.display = "none";
});
self.port.on("newRate", function(rate){
  console.info("received newRate with rate=%s...", rate);
	rate_value.textContent = rate;
});
self.port.on("show", function onShow() {
  btc_input.focus();
});