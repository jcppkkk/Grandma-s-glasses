var myTimer;
var updateTime = 1000;
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
var optBuilding = function (best, target, cookies, cookiesPs) {
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
			/* If product is more expansive than target, we must buy target. */
			/* Caculating of buying best product is done in first call. */
			stateAfterBought[i] = {
				id: i,
				time: Infinity,
				cookies: null,
				cookiesPs: null
			};
		} else if (product.price > cookies) {
			/* buy product with optimal time then buy target */
			var afterBp = optBuilding(best, product, cookies, cookiesPs);
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
var updatePage = function () {
	var titleColor = [];
	for (var i = Game.ObjectsN; i--; titleColor[i] = "") {}
	var CP = Game.ObjectsById.map(function (product) {
		return (product.storedCps / product.price);
	});
	var bestPid = CP.indexOf(Math.max.apply(Math, CP));
	var best = Game.ObjectsById[bestPid];
	var newTime = 1000;
	timeDiv = document.getElementById('time');
	if (timeDiv) {
		timeDiv.parentElement.removeChild(timeDiv);
	}
	if (best.price > Game.cookies) {
		optimal = optBuilding(best, best, Game.cookies, Game.cookiesPs);
		titleColor[optimal.id] = "#22b14c";
		var waitTime = (best.price - Game.cookies) / Game.cookiesPs;
		if (waitTime > 0 && waitTime != Infinity) {
			optProd = document.querySelectorAll(".product")[bestPid];
			optProd.innerHTML = optProd.innerHTML +
				'<div id="time" style="position:absolute;top:3px;right:3px;color:yellow">' +
				Number(waitTime).toHHMMSS() + '</div>';
			var shift = Math.abs((waitTime + 0.6) % 1 - 0.5);
			if (shift > 0.1) {
				newTime = ((waitTime + 0.1) % 1) * 1000;
			}
		}
	}
	titleColor[bestPid] = "yellow";
	var titles = document.querySelectorAll(".product .title:first-child");
	[].forEach.call(titles, function (title, id) {
		title.style.color = titleColor[id];
	});
	if (updateTime != newTime) {
		window.clearInterval(myTimer);
		myTimer = window.setInterval(updatePage, newTime);
		updateTime = newTime;
	}
};
document.getElementById('sectionRight').onclick = function () {
	setTimeout(updatePage, 50);
};
myTimer = window.setInterval(updatePage, updateTime);
updatePage();