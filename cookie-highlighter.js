var secondaryOptimalBuilding = function(best) {
	var bestPrice = Game.ObjectsById[best].price;
	var time = Game.ObjectsById.map(function(product) {
		if (product.id == best) {
			return (product.price - Game.cookies) / Game.cookiesPs;
		} else if (product.price > Game.cookies) {
			return Number.MAX_VALUE;
		} else {
			var cookiesAfterBuy = Game.cookies - product.price;
			return (bestPrice - cookiesAfterBuy) / (Game.cookiesPs + product.storedCps);
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
optimalBuilding();