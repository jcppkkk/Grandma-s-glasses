var optimalBuilding = function (target, cookies, cookiesPs) {
	var stateAfterBought = [];
	for (var i = Game.ObjectsN; i--;) {
		var product = Game.ObjectsById[i];
		if (i == target.id) {
			/* Not buy any other product, just wait & buy target */
			stateAfterBought[i] = {
				id: i,
				time: ((target.price - cookies) / cookiesPs),
				cookies: 0,
				cookiesPs: (cookiesPs + target.storedCps)
			};
		} else if (product.price > target.price) {
			/* This product is more expansive than target, exclude. */
			stateAfterBought[i] = {
				id: null,
				time: Number.MAX_VALUE,
				cookies: null,
				cookiesPs: null
			};
		} else if (product.price > cookies) {
			/* wait & buy some product(optimizable) then wait & buy target */
			var afterBp = optimalBuilding(product, cookies, cookiesPs);
			stateAfterBought[i] = {
				id: afterBp.id,
				time: afterBp.time + ((target.price - afterBp.cookies) / afterBp.cookiesPs),
				cookies: 0,
				cookiesPs: (afterBp.cookiesPs + target.storedCps)
			};
		} else {
			/* buy some product then wait & buy target */
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
var highlightBuilding = function () {
	var titleColor = [];
	for (var i = Game.ObjectsN; i--; titleColor[i] = "") {}
	var CP = Game.ObjectsById.map(function (product) {
		return (product.storedCps / product.price);
	});
	var bestProductId = CP.indexOf(Math.max.apply(Math, CP));
	var bestProduct = Game.ObjectsById[bestProductId];
	if (bestProduct.price > Game.cookies) {
		optimal = optimalBuilding(bestProduct, Game.cookies, Game.cookiesPs);
		titleColor[optimal.id] = "Lime";
	}
	titleColor[bestProductId] = "yellow";
	var titles = document.querySelectorAll(".content>.title:first-child");
	[].forEach.call(titles, function (title, id) {
		title.style.color = titleColor[id];
	});
};
document.getElementById('sectionRight').onclick = function () {
	setTimeout(function () {
		highlightBuilding()
	}, 50)
};
setInterval(function () {
	highlightBuilding();
}, 2000);
highlightBuilding();