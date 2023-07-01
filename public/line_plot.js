import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const url = '/datasets/n01.dat';
const data = await fetch(url)
  .then(response => response.arrayBuffer())
  .then(buffer => {
    const view = new DataView(buffer);
    let ecg = {};
    ecg.chan1 = new Array(view.byteLength / 4);
    ecg.chan2 = new Array(view.byteLength / 4);
    for (let i = 0; i < view.byteLength / 4; ++i) {
      ecg.chan1[i] = view.getInt16(i * 4, false);
      ecg.chan2[i] = view.getInt16(i * 4 + 2, false);
    }
    return ecg;
  });
console.log(data);

const svgSize = {
  width: 1200,
  height: 600
};

const xScale = d3.scaleLinear()
  .domain([0, data.chan1.length])
  .range([0, svgSize.width]);
const yScale = d3.scaleLinear()
  .domain([d3.min(data.chan1), d3.max(data.chan1)])
  .range([0, svgSize.height]);

const line = d3.line()
  .x((d, i) => xScale(i))
  .y(d => yScale(d));

const svg = d3.select('body')
  .append('svg')
  .attr('width', svgSize.width)
  .attr('height', svgSize.height);

svg.append('path')
  .attr('d', line(data.chan1))
  .attr('stroke', 'black')
  .attr('fill', 'none');

window.data = data;
window.d3 = d3;