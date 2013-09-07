var secondaryOptimalBuilding = function(best) {
	var time = Game.ObjectsById.map(function(product) {
		var waitProduct = (product.price - Game.cookies) / Game.cookiesPs;
		if (product.id == best) {
			/* Wait for best product */
			return waitProduct;
		} else {
			var bestPrice = Game.ObjectsById[best].price;
			if (product.price > Game.cookies) {
				/* Wait for secondary product, buy it and and wait for best product */
				var waitBest = bestPrice / (Game.cookiesPs + product.storedCps);
				return waitProduct + waitBest;
			} else {
				/* Buy secondary product and wait for best product */
				var cookiesLeft = Game.cookies - product.price;
				return (bestPrice - cookiesLeft) / (Game.cookiesPs + product.storedCps);
			}
		}
	});
	return time.indexOf(Math.min.apply(Math, time));
};
var optimalBuilding = function() {
	var CP = Game.ObjectsById.map(function(product) {
		return (product.storedCps / product.price);
	});
	var best = CP.indexOf(Math.max.apply(Math, CP));
	var faster = -1;
	if (Game.ObjectsById[best].price > Game.cookies) {
		faster = secondaryOptimalBuilding(best);
	}
	var titles = document.querySelectorAll(".content>.title:first-child");
	[].forEach.call(titles, function(item, id) {
		if (id == best) {
			item.style.color = "yellow";
		} else if (id == faster) {
			item.style.color = "Lime";
		} else {
			item.style.color = "";
		}
	});
};
document.getElementById('sectionRight').onclick = function() {
	setTimeout(function() {
		optimalBuilding()
	}, 50)
};
setInterval(function() {
   optimalBuilding();
}, 2000);