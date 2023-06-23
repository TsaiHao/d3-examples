console.log("start draw d3.js")
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

function arange(start, stop, step) {
    if (typeof stop == 'undefined') {
        // one param defined
        stop = start;
        start = 0;
    }
    if (typeof step == 'undefined') {
        step = 1;
    }
    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }
    let result = [];
    for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }
    return result;
}

const svgSize = {
    width: 600,
    height: 600
}
const margin = {
    top: 50,
    left: 50
}
const figureSize = {
    width: svgSize.width - margin.left * 2,
    height: svgSize.height - margin.top * 2
}
const text = await fetch('/iris.csv').then(res => res.text());

const data = d3.csvParse(text, d3.autoType);
window.data = data;
window.d3 = d3;

const svg = d3.select('body')
    .append('svg')
    .attr('width', svgSize.width)
    .attr('height', svgSize.height);

const colorMap = {
    "Iris-setosa": "black",
    "Iris-versicolor": "red",
    "Iris-virginica": "blue"
};

let stats = {};
for (let item of data.columns) {
    if (typeof data[0][item] === 'number') {
        stats[item] = {};
        const maxValue = d3.max(data, d => d[item]);
        const minValue = d3.min(data, d => d[item]);
        const margin = (maxValue - minValue) * 0.1;
        stats[item].min = minValue - margin;
        stats[item].max = maxValue + margin;
    }
}
console.log(stats);

const xItem = 'PetalLengthCm';
const yItem = 'SepalLengthCm';
const xScaleFactor = figureSize.width / (stats[xItem].max - stats[xItem].min);
const yScaleFactor = figureSize.height / (stats[yItem].max - stats[yItem].min);

svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => {
        const x = d[xItem] - stats[xItem].min;
        return x * xScaleFactor + margin.left;
    })
    .attr('cy', d => {
        const y = d[yItem] - stats[yItem].min;
        return svgSize.height - y * yScaleFactor - margin.top;
    })
    .attr('r', 5)
    .attr('fill', d => colorMap[d.Species]);

const xScale = d3.scaleLinear()
    .domain([stats[xItem].min, stats[xItem].max])
    .range([0, figureSize.width]);
const yScale = d3.scaleLinear()
    .domain([stats[yItem].min, stats[yItem].max])
    .range([figureSize.height, 0]);

const xAxis = d3.axisBottom(xScale)
    .tickValues(arange(stats[xItem].min, stats[xItem].max, 0.5))
    .tickFormat(d3.format(".1f"))
    .tickSizeOuter(0);
svg.append('g')
    .attr('transform', `translate(${margin.left}, ${svgSize.height - margin.top})`)
    .call(xAxis)
svg.append('text')
    .attr('x', svgSize.width / 2)
    .attr('y', svgSize.height - margin.top / 4)
    .attr('text-anchor', 'middle')
    .text(xItem);

const yAxis = d3.axisLeft(yScale)
    .tickValues(arange(stats[yItem].min, stats[yItem].max, 0.5))
    .tickFormat(d3.format(".1f"))
    .tickSizeOuter(0);
svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .call(yAxis);
svg.append('text')
    .attr('x', -svgSize.height / 2)
    .attr('y', margin.left / 4)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text(yItem);