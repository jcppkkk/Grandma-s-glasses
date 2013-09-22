// Grandma's Glasses
//
//     "Get universal omniscient by seeing through grandma's glasses."
// 
// Official Website -> http://scyu.logdown.com/posts/2013/09/12/grandma-s-glasses
// Reddit Thread 	-> http://redd.it/1mkwx8
//
/* External Libraries */
if (!l) {
	l = function (what) {
		return document.getElementById(what);
	};
}
if (!Number.prototype.toTimeString) {
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
		if (days) {
			str = days + 'd ' + hours + 'h ';
		} else if (hours) {
			str = hours + 'h ' + minutes + 'm ';
		} else if (minutes) {
			str = minutes + 'm ' + seconds + 's ';
		} else {
			str = seconds + 's ';
		}
		return str;
	};
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
	/* adjust timer if waitTime not in x.95±0.05 */
	if (loop == "loop") {
		var newTime;
		if (timeDiv.textContent != " ") {
			var shift = Math.abs((waitTime + 0.55) % 1 - 0.5);
			if (shift > 0.05) {
				newTime = ((waitTime + 0.05) % 1);
			}
			if (cookieClicks != Game.cookieClicks && newTime > 0.25) {
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
			return hl.buyingTime(chain.slice(1), baseCookies - price);
		});
	} else {
		var waitTime = (price - baseCookies) / hl.cps();
		return hl.ifBought(first, function () {
			return waitTime + hl.buyingTime(chain.slice(1), 0);
		});
	}
	throw ("Unhandled buyingTime case.");
};
hl.highlight = function () {
	var itemOrUpgrade = Game.ObjectsById.concat(Game.UpgradesInStore);
	var baseCookies = Game.cookies;
	/* init objects */
	for (var i = itemOrUpgrade.length - 1; i >= 0; i--) {
		var me = itemOrUpgrade[i];
		me.color = "";
		if (me instanceof Game.Upgrade) me.price = me.basePrice;
	}
	/* best bestGainedCpsPs after payback */
	var target;
	var bestGainedCpsPs = 0;
	var baseCps = hl.cps();
	if (baseCps) {
		for (var i = itemOrUpgrade.length - 1; i >= 0; i--) {
			var me = itemOrUpgrade[i];
			var paybackTime;
			var cpsAfterBought;
			var GainedCps;
			hl.ifBought(me, function () {
				cpsAfterBought = hl.cps();
			});
			if (me.price > baseCookies) {
				paybackTime = (me.price - baseCookies) / baseCps;
				paybackTime += baseCookies / cpsAfterBought;
			} else {
				paybackTime = me.price / cpsAfterBought;
			}
			var gainedCpsPs = (cpsAfterBought - baseCps) / paybackTime;
			if (gainedCpsPs > bestGainedCpsPs) {
				bestGainedCpsPs = gainedCpsPs;
				target = me;
			}
		}
	} else {
		target = Game.ObjectsById[0];
	}
	/* multiple level optmize */
	var bestChain = [target];
	var time = hl.buyingTime([target], baseCookies);
	while (bestChain[0].price > baseCookies) {
		var bestAssist = null;
		for (var i = itemOrUpgrade.length - 1; i >= 0; i--) {
			var me = itemOrUpgrade[i];
			if (me === target) continue;
			var subTime = hl.buyingTime([me].concat(bestChain), baseCookies);
			if (subTime < time) {
				time = subTime;
				bestAssist = me;
			}
		}
		if (bestAssist) bestChain.unshift(bestAssist);
		else break;
	}
	/* Assign highlight color */
	bestChain.reverse();
	var g = 255;
	for (var i = bestChain.length - 1; i >= 0; i--) {
		if (bestChain[i].color == "") {
			bestChain[i].color = "rgb(0," + g + ",0)";
			g = Math.ceil(g * 0.8);
		}
	}
	/* Update highlight color */
	var itemTitles = document.querySelectorAll(".product .title:first-child");
	var highlighted = false;
	[].forEach.call(itemTitles, function (title, id) {
		var color = Game.ObjectsById[id].color
		if (title.style.color != color) {
			title.style.color = color;
		}
		if (color != "") highlighted = true;
	});
	if (highlighted) {
		var pTag = document.createElement('div');
		pTag.id = "productHighlighted";
		l("product0").appendChild(pTag);
	}
	var theParent = document.querySelector("#upgrades");
	highlighted = false;
	for (var id = Game.UpgradesInStore.length; id--;) {
		var icon = document.querySelector("div#upgrade" + id);
		var color = Game.UpgradesInStore[id].color;
		if (icon.style.backgroundColor != color) {
			icon.style.backgroundColor = color;
			if (color != "") {
				highlighted = true;
				if (theParent.firstChild != icon) theParent.insertBefore(icon, theParent.firstChild);
			}
		}
	}
	if (highlighted) {
		var uTag = document.createElement('div');
		uTag.id = "upgradeHighlighted";
		l("upgrade0").appendChild(uTag);
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
			right: 3px;\
			font-size: 20px;\
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
			position: relative;\
			top: 3px;\
			right: 3px;\
			font-size: 12px;\
			text-shadow: 0px 0px 4px #000;\
		}";
	document.body.appendChild(css);
	/* timer updater */
	for (var i = Game.ObjectsN; i--;) hl.timer(i, "loop");
	l('sectionRight').onclick = function () {
		setTimeout(function () {
			for (var i = Game.ObjectsN; i--;) hl.timer(i);
		}, 50);
	};
	/* highlight updater */
	setInterval(function () {
		if (l("productHighlighted") || l("upgradeHighlighted")) return;
		hl.highlight();
		console.log(new Date() + " highlight.");
	}, 100);
	/* Add version */
	var version = l("GrandmaGlassesVersion");
	if (!version) {
		var version = document.createElement("div");
		version.className = "GrandmaGlassesVersion";
		version.id = "GrandmaGlassesVersion";
		version.textContent = "Grandma's Glasses v.1.036.12";
		var parent = l("donate");
		parent.insertBefore(version, parent.firstChild);
	}
	Game.particlesAdd(version.textContent + " Loaded!");
};
hl.init();