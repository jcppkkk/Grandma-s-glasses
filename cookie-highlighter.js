// Grandma's Glasses
//
//     "Get universal omniscient by seeing through grandma's glasses."
// 
// Official Website -> http://scyu.logdown.com/posts/2013/09/12/grandma-s-glasses
// Reddit Thread 	-> http://redd.it/1mkwx8
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
		hl.highlight();
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
hl.cpsString = Game.CalculateGains.toString().replace(
	/Game\.(cookiesPs|Win|computedMouseCps)/g, "hl.$1").replace(
	/for.*cpsAchievs.*\)/, "if(0)").replace(/Game\.recalculateGains=0/g,
	"return hl.cookiesPs");
hl.cps = eval("(" + hl.cpsString + ")");
hl.ifBought = function (me, callback) {
	var returnValue;
	if (me instanceof Game.Upgrade) {
		me.bought++;
		returnValue = callback();
		me.bought--;
	} else {
		var buy = me.buy;
		me.buy = function () {};
		var price = me.price;
		me.amount++;
		me.price = me.basePrice * Math.pow(Game.priceIncrease, me.amount);
		returnValue = callback();
		me.amount--;
		me.price = price;
		me.buy = buy;
	}
	return returnValue;
};
hl.buyingTime = function (chain, baseCookies) {
	if (chain.length == 0) return 0;
	var first = chain[0];
	var price = first.price;
	if (price <= baseCookies) {
		return hl.ifBought(first, function () {
			return hl.buyingTime(chain.slice(1), baseCookies - price)
		});
	} else {
		var waitTime = (price - baseCookies) / hl.cps();
		return hl.ifBought(first, function () {
			return waitTime + hl.buyingTime(chain.slice(1), 0)
		});
	}
	throw ("Unhandled buyingTime case.");
};
hl.highlight = function () {
	for (var i = Game.ObjectsN; i--; Game.ObjectsById[i].color = "");
	for (var i = Game.UpgradesInStore.length; i--;) {
		Game.UpgradesInStore[i].color = "";
	}
	var baseCookies = Game.cookies;
	var baseCps = hl.cps();
	var maxCP = 0;
	var target;
	var itemOrUpgrade = Game.ObjectsById.concat(Game.UpgradesInStore);
	for (var i = itemOrUpgrade.length - 1; i >= 0; i--) {
		var me = itemOrUpgrade[i];
		var GainedCookiesPs = hl.ifBought(me, function () {
			return hl.cps() - baseCps;
		});
		if (me instanceof Game.Upgrade) {
			me.price = me.basePrice;
		}
		var cp = GainedCookiesPs / me.price;
		if (cp > maxCP) {
			maxCP = cp;
			target = me;
		}
	};
	/* 3-level optimize */
	hl.chains = [];
	if (target.price > baseCookies) {
		hl.chains.push({
			chain: [target],
			time: hl.buyingTime([target], baseCookies)
		});
		for (var b2Id = Game.ObjectsById.length - 1; b2Id >= 0; b2Id--) {
			var b2 = Game.ObjectsById[b2Id];
			if (b2 === target || b2.price >= target.price) continue;
			hl.chains.push({
				chain: [b2, target],
				time: hl.buyingTime([b2, target], baseCookies)
			});
			for (var b1Id = Game.ObjectsById.length - 1; b1Id >= 0; b1Id--) {
				var b1 = Game.ObjectsById[b1Id];
				if (b1 === target || b1.price >= target.price) continue;
				if (b1 === b2 && b1 instanceof Game.Upgrade) continue;
				hl.chains.push({
					chain: [b1, b2, target],
					time: hl.buyingTime([b1, b2, target], baseCookies)
				});
			}
		}
	};
	hl.chains.sort(function (a, b) {
		return a.time - b.time
	});
	/*
	for (var i = hl.chains.length - 1; i >= 0; i--) {
		console.log(i, hl.chains[i].chain.map(function (me) {
			return me.name;
		}), hl.chains[i].time);
	};
	*/
	if (hl.chains.length > 0) hl.chains[0].chain[0].color = "#22b14c";
	target.color = "yellow";
	/* Update highlight color*/
	var itemTitles = document.querySelectorAll(".product .title:first-child");
	[].forEach.call(itemTitles, function (title, id) {
		title.style.color = Game.ObjectsById[id].color;
	});
	var theParent = document.querySelector("#upgrades");
	for (var id = Game.UpgradesInStore.length; id--;) {
		var icon = document.querySelector("div#upgrade" + id);
		icon.style.backgroundColor = Game.UpgradesInStore[id].color;
		if (Game.UpgradesInStore[id].color != "") {
			if (theParent.firstChild != icon) theParent.insertBefore(icon, theParent.firstChild);
			/*if (icon.innerHTML == "") icon.innerHTML =
				'<div class="upgradeTimer">5m 49s</div>';*/
		}
	}
};
hl.init = function () {
	/* init CSS */
	var css = document.createElement("style");
	css.type = "text/css";
	css.innerHTML =
		".timer {\
			position: relative;\
			float: right;\
			font-size: 24px;\
			z-index: 1000;\
			font-weight: bold;\
			text-shadow: -1px 0 3px black, 0 1px 3px black, 1px 0 3px black, 0 -1px 3px black;\
		}\
		.upgradeTimer {\
			margin: 6px;\
			font-weight: bold;\
			text-shadow: -1px 0 3px black, 0 1px 3px black, 1px 0 3px black, 0 -1px 3px black;\
		}\
		.GrandmaGlassesVersion {\
			position: absolute;\
			top: 3px;\
			right: 3px;\
			font-size: 12px;\
			text-shadow: 0px 0px 4px #000;\
		}";
	document.body.appendChild(css);
	/* first calc */
	l('sectionRight').onclick = function () {
		setTimeout(function () {
			for (var i = Game.ObjectsN; i--; hl.timer(i)) {}
			clearInterval(hl.highlightTimer);
			hl.highlight();
			hl.highlightTimer = setInterval(hl.highlight, 2000);
		}, 50);
	};
	hl.highlight();
	/* add update */
	for (var i = Game.ObjectsN; i--;) {
		hl.timer(i, "loop");
	}
	hl.highlightTimer = setInterval(hl.highlight, 2000);
	/* Add version */
	var version = l("GrandmaGlassesVersion");
	if (!version) {
		var version = document.createElement("div");
		version.className = "GrandmaGlassesVersion";
		version.id = "GrandmaGlassesVersion";
		version.textContent = "Grandma's Glasses v.1.036.08"
		l("storeTitle").appendChild(version);
	}
	Game.particlesAdd(version.textContent + " Loaded!");
};
hl.init();