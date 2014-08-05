function draw() {
	var bst_size = parseInt(d3.select("#bst_size").property("value"));
	var p = new Array(bst_size + 1);
	var result = bst_permutation(p, bst_size);
	
	var root = generateTree(p, bst_size);
	var width = 1280, height = 800, w = 120, h = 20, i = 0, duration = 500;
	
	var tree = d3.layout.tree()
    .size([height - 2 * h, width - 2 * w]);
    
	var diagonal = d3.svg.diagonal()
		.projection(function(d) { return [d.y, d.x]; });

	d3.selectAll("g").remove();
	
	var vis = d3.select(".chart")
		.attr("height", height)
		.attr("width", width)
		.append("svg:g")
		.attr("transform", "translate(" + w + "," + h + ")");

	root.x0 = (height - 2 * h) / 2;
	root.y0 = 0;

	toggleAll(root);
	update(root);
	d3.select("#show_value").on("change", function(d) { update(root) });
	
	function update(source) {
		var showValue = d3.select("#show_value").property("checked");
		// Nodes
		var nodes = tree.nodes(root).reverse();
		nodes.forEach(function(d) { d.y = d.depth * 180; });
		
		var node = vis.selectAll("g.node")
			.data(nodes, function(d) { return d.id || (d.id = ++i); });
		
		var nodeGroup = node.enter()
			.append("svg:g")
			.attr("class", "node")
			.attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
			.on("click", function(d) { toggle(d); update(d); });
		
		nodeGroup.append("svg:rect")
			.attr("x", -10)
			.attr("y", -10)
			.style("stroke", function(d) { return d.root == null ? "steelblue" : "darkred"; })
			.style("fill", fillNode);
			
		nodeGroup.append("svg:text")
			.attr("x", function(d) { return d.root == null ? -15 : 15; })
			.attr("dy", ".35em")
			.attr("text-anchor", function(d) { return d.root == null ? "end" : "start"; })
			.text(function(d) { return showValue ? d.value : d.name; })
			.style("fill-opacity", 1e-6);
		
		var nodeUpdate = node.transition()
			.duration(duration)
			.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
		
		nodeUpdate.select("rect")
			.attr("width", 20)
			.attr("height", 20)
			.style("fill", fillNode);
		
		nodeUpdate.select("text")
			.style("fill-opacity", 1)
			.text(function(d) { return showValue ? d.value : d.name; });
		
		var nodeExit = node.exit()
			.transition()
			.duration(duration)
			.attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
			.remove();
		
		nodeExit.select("text")
			.style("fill-opacity", 1e-6);
		
		// Links
		var link = vis.selectAll("path.link")
			.data(tree.links(nodes), function(d) { return d.target.id; })
		
		link.enter()
			.insert("svg:path", "g")
			.attr("class", "link")
			.attr("d", function(d) {
				var o = {x:source.x0, y:source.y0};
				return diagonal({source: o, target: o});
			})
			.transition()
				.duration(duration)
				.attr("d", diagonal);
		
		link.transition()
			.duration(duration)
			.attr("d", diagonal);
		
		link.exit()
			.transition()
			.duration(duration)
			.attr("d", function(d) {
				var o = {x:source.x, y:source.y};
				return diagonal({source: o, target: o});
			})
			.remove();
		
		nodes.forEach(function(d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});
	}
}

function bst_permutation(p, n) {
	if (p[n] == undefined) {
		if (n == 0)
			p[n] = 1;
		else {
			var sum = 0, i = 0;
			for (;i < n;++i) {
				sum += bst_permutation(p, i) * bst_permutation(p, n-1-i);
			}
			p[n] = sum;
		}
	}
	
	return p[n];
}

function generateTree(p, n) {
	var node = new Object();
	node.name = "p[" + n + "]";
	node.value = p[n];
	node.children = n == 0 ? null : new Array(n);
	for (var i = 0; i < n; ++i) {
		node.children[i] = {
			"root"  : i + 1,
			"name"	: "Sub-solution " + (i + 1),
			"value" : p[i] + "*" + p[n-1-i],
			"children"  : [generateTree(p,i),generateTree(p,n-1-i)]
		}
	}
	return node;
}

function toggle(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
}

function toggleAll(d) {
    if (d.children) {
        d.children.forEach(toggleAll);
        toggle(d);
    }
}

function fillNode(d) {
    return d._children ? "lightsteelblue" : "#fff";
}