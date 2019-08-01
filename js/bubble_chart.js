
function bubbleChart() {
    var width = 1024;
    var height = 768;
    var tooltip = floatingTooltip('gates_tooltip', 240);
    var center = {x: width / 2, y: height / 2};

    var statusCenters = {
        acquired: {x: 3 * width / 16, y: height / 3.9},
        operating: {x: width / 3, y: 2 * height / 4.2},
        closed: {x: 3 * width / 6.5, y: height / 3.9}
    };
    var statusTitles = {
        acquired: {x: 3 * width / 18.5, y: height / 20},
        operating: {x: width / 3, y: 2 * height / 8.8},
        closed: {x: 3 * width / 6, y: height / 18}
    };

    var countryCenters = {
        USA: {x: 3 * width / 15, y: height / 2.4},
        CANADA: {x: 3 * width / 6.5, y: height / 3.0}
    };
    var countryTitles = {
        USA: {x: 3 * width / 14, y: height / 14},
        CANADA: {x: 3 * width / 5.6, y: height / 14}
    };

    var forceStrength = 0.03;
    var bubbles = null;
    var nodes = [];
    var bubble_svg=null;

    function charge(d) {
        return -Math.pow(d.radius, 2.0) * forceStrength;
    }

    var simulation = d3.forceSimulation()
        .velocityDecay(0.2)
        .force('x', d3.forceX().strength(forceStrength).x(center.x))
        .force('y', d3.forceY().strength(forceStrength).y(center.y))
        .force('charge', d3.forceManyBody().strength(charge))
        .on('tick', ticked);

    simulation.stop();

    var fillColor = d3.scaleOrdinal(d3.schemeCategory20c)
        .domain(['acquired', 'operating', 'closed']);

    function createNodes(rawData) {

        var maxRounds = d3.max(rawData, function (d) {
            return +d.funding_rounds;
        });

        var radiusScale = d3.scalePow()
            .exponent(0.5)
            .range([2, 35])
            .domain([0, maxRounds]);

        var myNodes = rawData.map(function (d) {
            return {
                radius: radiusScale(+(d.funding_rounds/10)),
                market: d.market,
                country: d.country_code,
                state : d.state_code,
                region: d.region,
                funded_quarter : d.funded_quarter,
                funding_total_usd : d.funding_total_usd,
                funding_rounds : d.funding_rounds,
                status : d.status,
                x: Math.random() * 900,
                y: Math.random() * 800
            };
        });

        myNodes.sort(function (a, b) {
            return b.funding_rounds - a.funding_rounds;
        });

        return myNodes;
    }


    var chart = function chart(selector, rawData) {
        nodes = createNodes(rawData);
        bubble_svg = d3.select(selector)
            .append('svg')
            .attr('id', 'bubble_svg')
            .attr('width', width)
            .attr('height', height);

        bubbles = bubble_svg.selectAll('.bubble')
            .data(nodes, function (d) {
                return d.id;
            });

        var bubblesE = bubbles.enter().append('circle')
            .classed('bubble', true)
            .attr('r', 0)
            .attr('fill', function (d) {
                return fillColor(d.region);
            })
            .attr('stroke', function (d) {
                return d3.rgb(fillColor(d.region)).darker();
            })
            .attr('stroke-width', 2)
            .on('mouseover', showDetail)
            .on('mouseout', hideDetail);

        bubbles = bubbles.merge(bubblesE);

        bubbles.transition()
            .duration(2000)
            .attr('r', function (d) {
                return d.radius;
            });

        simulation.nodes(nodes);
        groupBubbles();
    };

    function ticked() {
        bubbles
            .attr('cx', function (d) {
                return d.x;
            })
            .attr('cy', function (d) {
                return d.y;
            });
    }

    function countryXPosition(d) {
        if(d.country === 'CAN'){
            return countryCenters["CANADA"].x;
        }
        return countryCenters[d.country].x;
    }

    function countryYPosition(d) {
        if(d.country === 'CAN'){
            return countryCenters["CANADA"].y;
        }
        return countryCenters[d.country].y;
    }

    function statusXPosition(d) {
        return statusCenters[d.status].x;
    }

    function statusYPosition(d) {
        return statusCenters[d.status].y;
    }

    function groupBubbles() {
        hideTitles('.country');
        hideTitles('.status');
        d3.selectAll("#bubble_region_annotation").remove();
        d3.selectAll("#bubble_product_annotation").remove();
        simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));
        simulation.force('y', d3.forceY().strength(forceStrength).y(center.y));
        simulation.alpha(1).restart();
    }


    function splitStatusBubbles() {
        hideTitles('.country');
        hideTitles('.status');
        showTitles(statusTitles, 'status');
        d3.selectAll("#bubble_region_annotation").remove();
        d3.selectAll("#bubble_product_annotation").remove();
        d3.select("#bubble_svg").append("g")
            .attr("class", "annotation-group")
            .attr("id", "bubble_product_annotation")
            .call(bubble_status_makeAnnotations);

        simulation.force('x', d3.forceX().strength(forceStrength).x(statusXPosition));
        simulation.force('y', d3.forceY().strength(forceStrength).y(statusYPosition));
        simulation.alpha(1).restart();
    }


    function splitCountryBubbles() {
        hideTitles('.country');
        hideTitles('.status');
        showTitles(countryTitles, 'country');
        d3.selectAll("#bubble_region_annotation").remove();
        d3.selectAll("#bubble_product_annotation").remove();
        d3.select("#bubble_svg").append("g")
            .attr("class", "annotation-group")
            .attr("id", "bubble_region_annotation")
            .call(bubble_country_makeAnnotations);

        simulation.force('x', d3.forceX().strength(forceStrength).x(countryXPosition));
        simulation.force('y', d3.forceY().strength(forceStrength).y(countryYPosition));
        simulation.alpha(1).restart();
    }

    function hideTitles(title) {
        bubble_svg.selectAll(title).remove();
    }


    function showTitles(title, titleClass) {
        var titleData = d3.keys(title);
        var titles = bubble_svg.selectAll('.' + titleClass)
            .data(titleData);

        titles.enter().append('text')
            .style('fill','#000000')
            .attr('class', titleClass)
            .attr('x', function (d) {
                return title[d].x;
            })
            .attr('y', function (d) {
                return title[d].y;
            })
            .attr('text-anchor', 'middle')
            .text(function (d) {
                return d;
            });
    }

    function showDetail(d) {
        d3.select(this).attr('stroke', 'black');
        var content = '<span class="name">Country: </span><span class="value">' +
            d.country +
            '</span><br/>' +
            '<span class="name">State: </span><span class="value">' +
            d.state +
            '</span><br/>' +
            '<span class="name">Market: </span><span class="value">' +
            d.market +
            '</span><br/>' +
            '<span class="name">Funded Amount: </span><span class="value">' +
            d.funding_total_usd + "USD" +
            '</span><br/>' +
            '<span class="name">Status: </span><span class="value">' +
            d.status +
            '</span>';

        tooltip.showTooltip(content, d3.event);
    }

    /*
     * Hides tooltip
     */
    function hideDetail(d) {
        d3.select(this)
            .attr('stroke', d3.rgb(fillColor(d.country)).darker());

        tooltip.hideTooltip();
    }

    chart.toggleDisplay = function (displayName) {
        if (displayName === 'country') {
            splitCountryBubbles();
        } else if (displayName === 'status') {
            splitStatusBubbles();
        } else {
            groupBubbles();
        }
    };
    return chart;
}


var myBubbleChart = bubbleChart();


function display(error, data) {
    if (error) {
        console.log(error);
    }

    myBubbleChart('#vis', data);
}


function setupButtons() {
    d3.select('#toolbar')
        .selectAll('.button')
        .on('click', function () {
            d3.selectAll('.button').classed('active', false);
            var button = d3.select(this);
            button.classed('active', true);
            var buttonId = button.attr('id');
            myBubbleChart.toggleDisplay(buttonId);
        });
}


function addCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }

    return x1 + x2;
}

d3.csv('data/funding.csv', display);

setupButtons();
