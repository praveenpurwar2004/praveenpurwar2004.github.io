// Annotations for Bubble Chart
const bubble_country_annotations = [
    {
        type: d3.annotationLabel,
        note: {
            title: "Funding Data by Country",
            label: "United states has the highest market share",
            wrap: 190
        },
        connector: {
            end: "arrow",        // none, or arrow or dot
            type: "curve",       // Line or curve
            points: 3,           // Number of break in the curve
            lineType: "horizontal"
        },
        x: 400,
        y: 350,
        dy: 160,
        dx: 120
    }];

const bubble_country_makeAnnotations = d3.annotation()
    .type(d3.annotationLabel)
    .annotations(bubble_country_annotations);

const bubble_status_annotations = [
    {
        type: d3.annotationLabel,
        note: {
            title: "Funding data by Status",
            label: "Most of the funded status are operating.",
            wrap: 190
        },
        connector: {
            end: "arrow",        // none, or arrow or dot
            type: "curve",       // Line or curve
            points: 3,           // Number of break in the curve
            lineType: "horizontal"
        },
        x: 520,
        y: 420,
        dy: 160,
        dx: 130
    }];

const bubble_status_makeAnnotations = d3.annotation()
    .type(d3.annotationLabel)
    .annotations(bubble_status_annotations);

// Annotations for Zoomable Sunburst
const zoom_annotations = [
    {
        type: d3.annotationLabel,
        note: {
            title: "Highest Market Share",
            label: "Countries of Western Europe has the highest market share compared to other regions. The same can be seen in the bubble chart in the above ",
            wrap: 190
        },
        x: 650,
        y: 200,
        dy: -100,
        dx: 200
    }]

const zoom_makeAnnotations = d3.annotation()
    .type(d3.annotationLabel)
    .annotations(zoom_annotations)

d3.select("#zoomable_svg")
    .append("g")
    .attr("class", "annotation-group")
    .attr("id", "zoom_annotation")
    .call(zoom_makeAnnotations)

// Annotations for Line Chart
const line_annotations = [
    {
        type: d3.annotationLabel,
        note: {
            title: "Weeknight Checkin Spike",
            label: "Spikes nightly for checkins",
            wrap: 190
        },
        x: 250,
        y: 125,
        dy: 0,
        dx: 0
    },
    {
        type: d3.annotationLabel,
        note: {
            title: "Weekend Checkin Spike",
            label: "Increased spike of checkins over the weekend",
            wrap: 190
        },
        x: 650,
        y: 200,
        dy: -100,
        dx: -150
    }]

const line_makeAnnotations = d3.annotation()
    .type(d3.annotationLabel)
    .annotations(line_annotations)

d3.select("#linechart_svg")
    .append("g")
    .attr("class", "annotation-group")
    .attr("id", "linechart_annotation")
    .call(line_makeAnnotations)