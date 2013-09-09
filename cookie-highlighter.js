// Cookie-Clicker-Highlighter
//
//	"Baking better cookies in a more efficient way.""
// 
// Official Website -> http://bit.ly/CookieHighlighter
// Reddit Thread 	-> http://bit.ly/1cZn8Eq
// Version: v0.1.2
//
var hl = new Object();
hl.init = function () {
	hl.init_CountdownTimer();
	hl.updateTimer();
	hl.updateBuilding();
	document.getElementById('sectionRight').onclick = function () {
		setTimeout(hl.updateTimer, 50);
		setTimeout(hl.updateBuilding, 50);
	};
};
/* Multi countdown timer */
hl.init_CountdownTimer = function () {
	// Timer style
	var css = document.createElement("style");
	css.type = "text/css";
	css.innerHTML = ".timer { position:absolute;top:3px;right:3px;color:yellow }";
	document.body.appendChild(css);
	hl.timer = [];
	hl.updateTime = [];
	for (var i = Game.ObjectsN; i--; hl.updateTime[i] = 1000) {}
};
hl.updateTimer = function () {
	for (var i = Game.ObjectsN; i--;) {
		if (Game.ObjectsById[i].price > Game.cookies) {
			hl.countdown(i);
		}
	}
};
hl.countdown = function (i) {
	var id = "timer" + i;
	var timeDiv = document.getElementById(id);
	if (!timeDiv) {
		var str = '<div id="' + id + '" class="timer"> </div>';
		var pdiv = document.getElementById("product" + i);
		pdiv.innerHTML = pdiv.innerHTML + str;
		timeDiv = document.getElementById(id);
	}
	if (Game.ObjectsById[i].price > Game.cookies) {
		var newTime = 1000;
		var waitTime = (Game.ObjectsById[i].price - Game.cookies) / Game.cookiesPs;
		timeDiv.textContent = Number(waitTime).toHHMMSS();
		var shift = Math.abs((waitTime + 0.6) % 1 - 0.5);
		if (waitTime < 1) {
			newTime = waitTime * 1000;
		} else if (shift > 0.1) {
			newTime = ((waitTime + 0.1) % 1) * 1000;
		}
		if (hl.updateTime[i] != newTime) {
			window.clearInterval(hl.timer[i]);
			hl.timer[i] = window.setInterval(function () {
				hl.countdown(i);
			}, newTime);
			hl.updateTime[i] = newTime;
		}
	} else {
		timeDiv.textContent = " ";
	}
};
/* Optimal Buiding Highlighter */
hl.updateBuilding = function () {
	var titleColor = [];
	for (var i = Game.ObjectsN; i--; titleColor[i] = "") {}
	var CP = Game.ObjectsById.map(function (P) {
		return (P.storedCps / P.price);
	});
	var bestPid = CP.indexOf(Math.max.apply(Math, CP));
	var best = Game.ObjectsById[bestPid];
	if (best.price > Game.cookies) {
		optimal = hl.optimalBuilding(best, best, Game.cookies, Game.cookiesPs);
		titleColor[optimal.id] = "#22b14c";
	}
	titleColor[bestPid] = "yellow";
	var titles = document.querySelectorAll(".product .title:first-child");
	[].forEach.call(titles, function (title, id) {
		title.style.color = titleColor[id];
	});
};
hl.optimalBuilding = function (best, target, cookies, cookiesPs) {
	var stateAfterBought = [];
	for (var i = Game.ObjectsN; i--;) {
		var product = Game.ObjectsById[i];
		if (i == target.id) {
			/* wait & buy target(it might be best product in first call) */
			stateAfterBought[i] = {
				id: i,
				time: ((target.price - cookies) / cookiesPs),
				cookies: 0,
				cookiesPs: (cookiesPs + target.storedCps)
			};
		} else if (product.price > target.price || i == best.id) {
			/* If product is more expansive, we will buy target instead. */
			/* Caculating of buying best product is done in first call. */
			stateAfterBought[i] = {
				id: i,
				time: Infinity,
				cookies: null,
				cookiesPs: null
			};
		} else if (product.price > cookies) {
			/* buy product with optimal time then buy target */
			var afterBp = hl.optimalBuilding(best, product, cookies, cookiesPs);
			stateAfterBought[i] = {
				id: afterBp.id,
				time: afterBp.time + ((target.price - afterBp.cookies) / afterBp.cookiesPs),
				cookies: 0,
				cookiesPs: (afterBp.cookiesPs + target.storedCps)
			};
		} else {
			/* directly buy product then buy target */
			stateAfterBought[i] = {
				id: i,
				time: ((target.price - (cookies - product.price)) / (cookiesPs + product.storedCps)),
				cookies: 0,
				cookiesPs: (cookiesPs + product.storedCps + target.storedCps)
			};
		}
	}
	var times = stateAfterBought.map(function (el) {
		return el.time;
	});
	var minTimeId = times.indexOf(Math.min.apply(Math, times));
	return stateAfterBought[minTimeId];
};
/* External Libraries */
Number.prototype.toHHMMSS = function () {
	var seconds = Math.ceil(this),
		hours = Math.floor(seconds / 3600);
	seconds -= hours * 3600;
	var minutes = Math.floor(seconds / 60);
	seconds -= minutes * 60;
	var str = "";
	if (hours) str = str + hours + 'h ';
	if (hours || minutes) str = str + minutes + 'm ';
	str = str + seconds + 's ';
	return str;
}
/* Start Cookie-Clicker-Highlighter */
hl.init();