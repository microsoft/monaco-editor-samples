const d3 = require("d3");

var w = 500,
	h = 500,
	count = 10,
	fill = d3.scale.category10();
nodes = d3.range(count).map(Object);

var groupPath = function (d) {
	return "M" +
		d3.geom.hull(d.map(function (e) {
			return [e.x, e.y];
		}))
		.join("L") +
		"Z";
};

var groups = [];
groups.init = function () {
	groups.a = Math.min(w, h);
	groups.r = groups.a * 0.20;
	for (i = 0; i < 4; i++) {
		var g = [];
		g.groupId = i;
		g.x = w / 2;
		g.y = h / 2;
		var k = 0.25 * groups.a;
		g.x += i & 2 ? k : -k;
		g.y += i & 1 ? k : -k;

		for (j = 0; j < 5; j++) {
			var alpha = (2 * Math.PI * j / 5);
			50
			var dummy = {
				x: g.x + 10 * Math.sin(alpha),
				y: g.y + 10 * Math.cos(alpha)
			};
			g.push(dummy);
		}
		groups[i] = g;
	};
}


groups.snap = function (d) {

	function change(d, to) {
		if (d.groupId != null) {
			var oldGroup = groups[d.groupId];
			var index = oldGroup.indexOf(d);
			if (index >= 0) {
				oldGroup.splice(index, 1);
			}
		}

		if (to == null) {
			d.groupId = null;
		} else {
			d.groupId = to.groupId;
			to.push(d);
		}
	}

	groups.forEach(function (g) {
		var distance = Math.sqrt(Math.pow(d.x - g.x, 2) + Math.pow(d.y - g.y, 2));
		if (distance < groups.r) {
			if (d.groupId != g.groupId) {
				change(d, g);
			}
		} else {
			if (d.groupId == g.groupId) {
				change(d, null)
			}
		}
	});
}

groups.delta = function (d) {

	function massCenter(g) {
		var x = 0,
			y = 0;
		g.forEach(function (e) {
			x += e.x;
			y += e.y;
		});
		return {
			x: x / g.length,
			y: y / g.length
		};
	}

	if (d.groupId == null) return 0;
	var g = groups[d.groupId];
	var massCenter = massCenter(g);
	var delta = {
		x: g.x - massCenter.x,
		y: g.y - massCenter.y
	}
	return delta;
}

groups.init();


var nodeFill = function (n) {
	return n.groupId != null ? fill(n.groupId) : "lightgray";
};

var svg = d3.select("#chart").append("svg")
	.attr("width", w)
	.attr("height", h);


var force = d3.layout.force()
	.nodes(nodes)
	.links([])
	.size([w, h])
	.start();

var node = svg.selectAll("g.node")
	.data(nodes)
	.enter()
	.append("g")
	.attr("class", "node")
	// .attr("transform", function(d) {
	//             return "translate(" + d.x + "," + d.y + ")";
	// })
	// .style("stroke-width", 0.5)
	.on("mousemove", groups.snap)
	.call(force.drag);

node.append("rect")
	.attr("width", 80)
	.attr("height", 20)
	.attr("rx", 4)
	// .attr("transform", function(d) {
	//             return "translate(" + d.x + "," + d.y + ")";
	// })
	.style("fill", nodeFill)
	.style("stroke", function (d, i) {
		return d3.rgb(nodeFill).darker(2);
	});


node.append("text")
	.attr("dx", 10).attr("dy", 8)
	.style("font-size", "10px")
	.attr("text-anchor", "middle").style("fill", "black")

	.text(function (d) {
		return "VB";
	});

svg.style("opacity", 1e-6)
	.transition()
	.duration(1000)
	.style("opacity", 1);



var group = svg.selectAll("path")
	.data(groups)
	.attr("d", groupPath)
	.enter().insert("path", "g")
	.style("fill", nodeFill)
	.style("stroke", nodeFill)
	.style("stroke-width", 100)
	.style("stroke-linejoin", "round")
	.style("opacity", .2)

force.on("tick", function (e) {

	nodes.forEach(function (o) {
		if (o.groupId == null) return;
		o.x += groups.delta(o).x * .3;
		o.y += groups.delta(o).y * .3;
	});

	// node.attr("x", function (d) { return d.x; })
	// .attr("y", function (d) { return d.y; })
	//     .style("fill", nodeFill);
	node.attr("transform", function (d) {
		return "translate(" + d.x + "," + d.y + ")";
	});

	group.attr("d", groupPath);
});