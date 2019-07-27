// https://insights.stackoverflow.com/survey/2018/#technology-most-loved-dreaded-and-wanted-languages
var sample = [
   /* China,11.16
    India,3.04
    Indonesia,2.36
    Japan,3.34
    Malaysia,6.42
    SouthKorea,2.98
    Taiwan,3.48
    Thailand,3.51
    Vietnam,7.10
    Australia,3.23
    CzechRepublic,2.66
    Hungary,2.54
    Poland,3.95
    Romania,5.03
    Russia,3.78
    Ukraine,2.77
    Argentina,2.86
    Brazil,3.97
    Chile,2.52
    Colombia,1.78
    Mexico,5.08
    Venezuela,12.56
    Egypt,9.11
    Israel,-0.90
    Morocco,3.10
    SaudiArabia,5.78
    SouthAfrica,3.56
    UnitedArabEmirates,1.02
    Canada,2.94
    USA,1.79
    Austria,2.38
    Denmark,1.71
    France,2.96
    Germany,2.57
    Greece,2.49
    Italy,2.57
    Netherlands,3.48
    Norway,4.83
    Portugal,13.40
    Spain,2.86
    Sweden,1.25
    Turkey,3.44
    UnitedKingdom,2.78*/


    {
        language: 'China',
        value: 11.6,
        color: '#000000'
    },
    {
        language: 'India',
        value: 3.04,
        color: '#00a2ee'
    },
    {
        language: 'Indonesia',
        value: 2.36,
        color: '#fbcb39'
    },
    {
        language: 'Japan',
        value: 3.34,
        color: '#007bc8'
    },
    {
        language: 'Malaysia',
        value: 6.42,
        color: '#65cedb'
    },
    {
        language: 'SouthKorea',
        value: 2.98,
        color: '#ff6e52'
    },
    {
        language: 'Taiwan',
        value: 3.48,
        color: '#f9de3f'
    },
    {
        language: 'Thailand',
        value: 3.51,
        color: '#5d2f8e'
    },
    {
        language: 'Vietnam',
        value: 7.10,
        color: '#008fc9'
    },
    {
        language: 'Australia',
        value: 3.23,
        color: '#507dca'
    }
];

var svg = d3.select('#linechart_container').append('svg').attr("width","1024").attr("height","600");

var margin = 80;
var width = 1000 - 2 * margin;
var height = 600 - 2 * margin;

var chart = svg.append('g')
    .attr('transform', `translate(${margin}, ${margin})`);



d3.csv("data/barchart_sorted.csv", function(error, data) {

    var xScale = d3.scaleBand()
        .range([0, width])
        .domain(data.map((s) => s.country))
        .padding(0.4)

    var yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, 14]);


    var makeYLines = () => d3.axisLeft()
        .scale(yScale)

    chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    chart.append('g')
        .call(d3.axisLeft(yScale));


    chart.append('g')
        .attr('class', 'grid')
        .call(makeYLines()
            .tickSize(-width, 0, 0)
            .tickFormat('')
        );

    var barGroups = chart.selectAll()
        .data(data)
        .enter()
        .append('g');

    barGroups
        .append('rect')
        .attr('class', 'bar')
        .style('fill', (g) => '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6))
        .attr('x', (g) => xScale(g.country))
        .attr('y', (g) => yScale(g.market_share))
        .attr('height', (g) => height - yScale(g.market_share))
        .attr('width', xScale.bandwidth())
        .on('mouseenter', function (actual, i) {
            d3.selectAll('.value')
                .attr('opacity', 0);

            d3.select(this)
                .transition()
                .duration(300)
                .attr('opacity', 0.6)
                .attr('x', (a) => xScale(a.country) - 5)
                .attr('width', xScale.bandwidth() + 10);

            var y = yScale(actual.market_share);

            line = chart.append('line')
                .attr('id', 'limit')
                .attr('x1', 0)
                .attr('y1', y)
                .attr('x2', width)
                .attr('y2', y)

            barGroups.append('text')
                .attr('class', 'divergence')
                .attr('x', (a) => xScale(a.country) + xScale.bandwidth() / 2)
                .attr('y', (a) => yScale(a.market_share) + 30)
                .attr('fill', 'white')
                .attr('text-anchor', 'middle')
                .text((a, idx) => {
                    var divergence = (a.market_share - actual.market_share).toFixed(1)

                    let text = ''
                    if (divergence > 0) text += '+'
                    text += `${divergence}%`

                    return idx !== i ? text : '';
                })

        })
        .on('mouseleave', function () {
            d3.selectAll('.value')
                .attr('opacity', 1)

            d3.select(this)
                .transition()
                .duration(300)
                .attr('opacity', 1)
                .attr('x', (a) => xScale(a.country))
                .attr('width', xScale.bandwidth())

            chart.selectAll('#limit').remove()
            chart.selectAll('.divergence').remove()
        })

    barGroups
        .append('text')
        .attr('class', 'value')
        .attr('x', (a) => xScale(a.country) + xScale.bandwidth() / 2)
        .attr('y', (a) => yScale(a.market_share) + 30)
        .attr('text-anchor', 'middle')
        .text((a) => `${a.market_share}%`)
});

svg
    .append('text')
    .attr('class', 'label')
    .attr('x', -(height / 2) - margin)
    .attr('y', margin / 2.4)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .text('Market Share (%)')

svg.append('text')
    .attr('class', 'label')
    .attr('x', width / 2 + margin)
    .attr('y', height + margin * 1.7)
    .attr('text-anchor', 'middle')
    .text('Countries')

svg.append('text')
    .attr('class', 'title')
    .attr('x', width / 2 + margin)
    .attr('y', 40)
    .attr('text-anchor', 'middle')
    .text('Market Share By Countries')
