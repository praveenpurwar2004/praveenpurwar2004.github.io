var width = 1024,
    height = 650,
    radius = (Math.min(width, height) / 2) - 10;

var x = d3.scaleLinear().range([0, 2 * Math.PI]);
var y = d3.scaleSqrt().range([0, radius]);
var zsb_color = d3.scaleOrdinal(d3.schemeCategory20c);
var partition = d3.partition();
var arc = d3.arc()
    .startAngle(function (d) {
        return Math.max(0, Math.min(2 * Math.PI, x(d.x0)));
    })
    .endAngle(function (d) {
        return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));
    })
    .innerRadius(function (d) {
        return Math.max(0, y(d.y0));
    })
    .outerRadius(function (d) {
        return Math.max(0, y(d.y1));
    });

var zsb_tooltip = floatingTooltip('zsb_tooltip', 240);

var zsb_svg = d3.select("#zoomable_sunburst").append("svg")
    .attr('id', 'zoomable_svg')
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");


var parent_tree = {
    "name": "Market Share",
    "children": [
        {"name": "USA", "children": []},
        {"name": "CAN", "children": []}
    ]
};


d3.csv("data/funding.csv", function (error, data) {
    if (error) throw error;

    data.forEach(function (d) {
        buildTree(d);
    });

    root = d3.hierarchy(parent_tree)
        .sum(function (d) {
            return (d.funding_total);
        })
        .sort(function (a, b) {
            return b.value - a.value;
        });

    root.sum(function (d) {
        return (d.funding_total);
    });
    zsb_svg.selectAll("path")
        .data(partition(root).descendants())
        .enter().append("path")
        .attr("d", arc)
        .style("fill", function (d) {
            return zsb_color((d.children ? d : d.parent).data.name);
        })
        .on("click", click)
        .on('mouseover', showZSBDetail)
        .on('mouseout', hideZSBDetail);
});

function showZSBDetail(d) {
    var d1=d.data.name;
    if (d1 === 'CAN'){
        d1= "CANADA";
    }
    var content = '<span class="name">Name: </span><span class="value">' +
        d1 +
        '</span><br/>' +
        '<span class="name">Total Funding: </span><span class="value">' +
        d.value + 'USD' +
        '</span>';

    zsb_tooltip.showTooltip(content, d3.event);
}


function hideZSBDetail(d) {
    zsb_tooltip.hideTooltip();
}

function click(d) {
    d.parent == null ? d3v3.select("#zoom_annotation").classed("hidden", false) : d3v3.select("#zoom_annotation").classed("hidden", true);
    zsb_svg.transition()
        .duration(750)
        .tween("scale", function () {
            var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                yd = d3.interpolate(y.domain(), [d.y0, 1]),
                yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
            return function (t) {
                x.domain(xd(t));
                y.domain(yd(t)).range(yr(t));
            };
        })
        .selectAll("path")
        .attrTween("d", function (d) {
            return function () {
                return arc(d);
            };
        });
}


function buildTree(d) {
    parent_tree.children.forEach(function (child) {
        if (child.name === d.country_code) {
            var state_code = false;
            child.children.forEach(function (grandchild) {
                if (grandchild.name === d.state_code) {
                    state_code = true;
                }
            });
            if (!state_code) {
                child.children.push({"name": d.state_code, "children": []});
            }
            child.children.forEach(function (grandchild) {
                if (grandchild.name === d.state_code) {
                    countryFound = true;
                    var subCategory = {"name": d.market, "funding_total": d.funding_total_usd, "market" : d.market};
                    grandchild.children.push(subCategory);
                }
            });
        }
    });
}

d3.select(self.frameElement).style("height", height + "px");