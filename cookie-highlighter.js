// Cookie-Clicker-Highlighter
//
//	"Baking better cookies in a more efficient way.""
// 
// Official Website -> http://bit.ly/CookieHighlighter
// Reddit Thread 	-> http://bit.ly/1cZn8Eq
//
// Versions
//		v.1.035.04 : fix timers
//		v.1.035.05 : better timer CSS
//
var hl = new Object();
hl.init = function () {
	var version = document.getElementById("HighlighterVersion");
	if (!version) {
		var version = document.createElement("div");
		version.className = "HighlighterVersion";
		version.id = "HighlighterVersion";
		version.textContent = "Highlighter v.1.035.05"
		document.getElementById("storeTitle").appendChild(version);
	}
	/* init CountdownTimer */
	var css = document.createElement("style");
	css.type = "text/css";
	css.innerHTML =
		".timer {\
			position: relative;\
			float: right;\
			color: yellow;\
			font-size: 10px;\
			top: 6px;\
			right: 2px;\
			z-index: 1000;\
			font-weight: bold;\
			text-shadow: 1px 1px 1px #000,0px 1px 0px #000!important;\
		}\
		.HighlighterVersion {\
			position: absolute;\
			bottom: 3px;\
			right: 3px;\
			font-size: 12px;\
		}";
	document.body.appendChild(css);
	for (var i = Game.ObjectsN; i--;) {
		hl.timer(i, "loop");
	}
	/* init Optimal Building */
	//hl.updateBuilding();
	document.getElementById('sectionRight').onclick = function () {
		//setTimeout(hl.updateBuilding, 50);
		setTimeout(function () {
			for (var i = Game.ObjectsN; i--;) {
				hl.timer(i);
			}
		}, 50);
	};
};
hl.timer = function (i, loop) {
	var id = "timer" + i;
	/* update timer text */
	var timeDiv = document.getElementById(id);
	if (!timeDiv) {
		var timeDiv = document.createElement('div');
		timeDiv.className = "timer";
		timeDiv.id = id;
		var p = document.getElementById("product" + i)
		p.parentNode.insertBefore(timeDiv, p);
	}
	var waitTime = (Game.ObjectsById[i].price - Game.cookies) / Game.cookiesPs;
	timeDiv.textContent = Number(waitTime).toHHMMSS();
	/* adjust timer if waitTime not in x.95±0.05 */
	if (loop == "loop") {
		var newTime;
		if (timeDiv.textContent != " ") {
			var shift = Math.abs((waitTime + 0.55) % 1 - 0.5);
			if (shift > 0.05) {
				newTime = ((waitTime + 0.05) % 1);
			}
		}
		window.setTimeout(function () {
			hl.timer(i, "loop");
		}, newTime ? (newTime * 1000) : 1000);
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
	if (this <= 0 || isNaN(this) || this == Infinity) return " ";
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