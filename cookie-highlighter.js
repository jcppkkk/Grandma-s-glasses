// Cookie-Clicker-Highlighter
//
//	"Baking better cookies in a more efficient way.""
// 
// Official Website -> http://bit.ly/CookieHighlighter
// Reddit Thread 	-> http://bit.ly/1cZn8Eq
//
/* External Libraries */
if (!l) {
	function l(what) {
		return document.getElementById(what);
	}
}
Number.prototype.toTimeString = function () {
	if (this <= 0 || isNaN(this) || this == Infinity) return " ";
	var seconds = Math.ceil(this);
	var days = Math.floor(seconds / 86400);
	seconds %= 86400;
	var hours = Math.floor(seconds / 3600);
	seconds %= 3600;
	var minutes = Math.floor(seconds / 60);
	seconds %= 60;
	var str = "";
	if (days) str = str + days + 'd ';
	if (hours || days) str = str + hours + 'h ';
	if (minutes || hours || days) str = str + minutes + 'm ';
	str = str + seconds + 's ';
	return str;
};
if (!hl) {
	var hl = {};
}
hl.timer = function (i, loop, cookieClicks) {
	var id = "timer" + i;
	/* update timer text */
	var timeDiv = l(id);
	if (!timeDiv) {
		var timeDiv = document.createElement('div');
		timeDiv.className = "timer";
		timeDiv.id = id;
		var p = l("product" + i)
		p.parentNode.insertBefore(timeDiv, p);
	}
	var waitTime = (Game.ObjectsById[i].price - Game.cookies) / Game.cookiesPs;
	var oldText = timeDiv.textContent;
	timeDiv.textContent = Number(waitTime).toTimeString();
	if (oldText != " " && timeDiv.textContent == " ") {
		hl.markBuilding();
	}
	/* adjust timer if waitTime not in x.95±0.05 */
	if (loop == "loop") {
		var newTime;
		if (timeDiv.textContent != " ") {
			var shift = Math.abs((waitTime + 0.55) % 1 - 0.5);
			if (shift > 0.05) {
				newTime = ((waitTime + 0.05) % 1);
			} else if (cookieClicks != Game.cookieClicks) {
				newTime = 0.25;
			}
		}
		cookieClicks = Game.cookieClicks;
		window.setTimeout(function () {
			hl.timer(i, "loop", cookieClicks);
		}, newTime ? (newTime * 1000) : 1000);
	}
};
hl.CalculateGains = function () {
	var cookiesPs = 0;
	for (var i = Game.ObjectsN; i--;) {
		var me = Game.ObjectsById[i];
		var storedTotalCps = me.amount * me.cps();
		cookiesPs += storedTotalCps;
	}
	return cookiesPs;
};
hl.ifbuy = function (me, callback) {
	var buy = me.buy;
	me.buy = function () {};
	var price = me.price;
	me.amount++;
	me.price = me.basePrice * Math.pow(Game.priceIncrease, me.amount);
	var ret = callback();
	me.amount--;
	me.price = price;
	me.buy = buy;
	return ret;
};
hl.buyingTime = function (chain, baseCookies) {
	if (chain.length == 0) return 0;
	var first = chain[0];
	var price = first.price;
	if (price <= baseCookies) {
		return hl.ifbuy(first, function () {
			return hl.buyingTime(chain.slice(1), baseCookies - price)
		});
	} else {
		var waitTime = (price - baseCookies) / hl.CalculateGains();
		return hl.ifbuy(first, function () {
			return waitTime + hl.buyingTime(chain.slice(1), 0)
		});
	}
	throw ("Unhandled buyingTime case.");
};
hl.markBuilding = function () {
	var titleColor = [];
	for (var i = Game.ObjectsN; i--; titleColor[i] = "") {}
	var baseCookies = Game.cookies;
	var baseCookiesPs = hl.CalculateGains();
	var CP = Game.ObjectsById.map(function (me) {
		var GainedCookiesPs = hl.ifbuy(me, function () {
			return hl.CalculateGains() - baseCookiesPs;
		});
		return GainedCookiesPs / me.price;
	});
	var targetPid = CP.indexOf(Math.max.apply(Math, CP));
	var target = Game.ObjectsById[targetPid];
	var chains = [];
	if (target.price > baseCookies) {
		chains.push({
			chain: [target],
			time: hl.buyingTime([target], baseCookies)
		});
		for (var b2Pid = Game.ObjectsN; b2Pid--;) {
			var b2 = Game.ObjectsById[b2Pid];
			if (b2Pid == targetPid || b2.price >= target.price) continue;
			chains.push({
				chain: [b2, target],
				time: hl.buyingTime([b2, target], baseCookies)
			});
			for (var b1Pid = Game.ObjectsN; b1Pid--;) {
				var b1 = Game.ObjectsById[b1Pid];
				if (b1Pid == targetPid || b1.price >= target.price) continue;
				chains.push({
					chain: [b1, b2, target],
					time: hl.buyingTime([b1, b2, target], baseCookies)
				});
			}
		}
		chains.sort(function (a, b) {
			return a.time - b.time
		})
		/*for (var i = chains.length - 1; i >= 0; i--) {
			console.log(i, chains[i].chain.map(function (me) {
				return me.id;
			}), chains[i].time);
		};*/
		var best = chains[0];
		titleColor[best.chain[0].id] = "#22b14c";
	}
	titleColor[targetPid] = "yellow";
	var titles = document.querySelectorAll(".product .title:first-child");
	[].forEach.call(titles, function (title, id) {
		title.style.color = titleColor[id];
	});
};
hl.init = function () {
	/* init CSS */
	var css = document.createElement("style");
	css.type = "text/css";
	css.innerHTML =
		".timer {\
			position: relative;\
			float: left;\
			color: yellow;\
			font-size: 12px;\
			z-index: 1000;\
			font-weight: bold;\
			text-shadow: 1px 1px 1px #000,0px 1px 0px #000!important;\
		}\
		.HighlighterVersion {\
			position: absolute;\
			top: 3px;\
			right: 3px;\
			font-size: 12px;\
			text-shadow: 0px 0px 4px #000,0px 1px 0px #000!important;\
		}";
	document.body.appendChild(css);
	l('sectionRight').onclick = function () {
		setTimeout(function () {
			for (var i = Game.ObjectsN; i--; hl.timer(i)) {}
			hl.markBuilding();
		}, 100);
	};
	setInterval(hl.markBuilding, 1000);
	for (var i = Game.ObjectsN; i--;) {
		hl.timer(i, "loop");
	}
	/* Add version */
	var version = l("HighlighterVersion");
	if (!version) {
		var version = document.createElement("div");
		version.className = "HighlighterVersion";
		version.id = "HighlighterVersion";
		version.textContent = "Highlighter v.1.036.07"
		l("storeTitle").appendChild(version);
	}
	Game.particlesAdd(version.textContent + " Loaded!");
};
hl.init();