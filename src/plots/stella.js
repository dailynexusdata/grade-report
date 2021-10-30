import { select } from 'd3-selection';
import { nest } from 'd3-collection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { axisBottom } from 'd3-axis';
import { max } from 'd3-array';

// this plot is going to show how total grades change before/after covid
// lets try to make a grouped by chart like:
// https://observablehq.com/@d3/grouped-bar-chart
// just horizontal

// this is just made up data for now -- ill get the actual values later
const makePlot = (data) => {
  const container = select('#ucsb-grades-letter-pct-bars');

  container.selectAll('*').remove();

  const size = {
    height: 400,
    width: Math.min(600, window.innerWidth - 40),
  };

  const margin = {
    left: 25,
    right: 10,
    top: 10,
    bottom: 40,
  };

  // look through: https://dailynexusdata.github.io/wrangling
  // and play around with nest():
  const grouped = nest()
    .key((d) => {
      return d.letter;
    })
    .entries(data);

  container
    .append('h1')
    .text(
      "There Were More A's and Less of Every Other Grade During Online Instruction",
    );

  const uniqueLetters = grouped.map((d) => {
    return d.key;
  });
  // for the y scale, setup a scaleBand() with the unique letters
  const y = scaleBand()
    .domain(
      grouped.map((d) => {
        return d.key;
      }),
    )
    .range([margin.top, size.height - margin.bottom])
    .padding(0.2);
  const x = scaleLinear()
    .domain([
      0,
      max(data, (d) => {
        return d.pct;
      }),
    ])
    .range([margin.left, size.width - margin.right]);

  // -----------------------------------------------------------------------
  // setup an scale called `z` and make it scaleBand() with 'pre' and 'post'.
  const z = scaleBand()
    .domain(['pre', 'post'])
    .range([0, y.bandwidth()])
    .padding(0.05);

  // The y scale controls the spacing of the letter groups
  // the z scale controls the spacing of the bars within each group

  // the max height is going to be y.bandwidth().
  // Create another object like 'margin' but call it 'innerMargin' or something and have a
  // top and bottom to use in this `z` scale
  // -----------------------------------------------------------------------

  const svg = container
    .append('svg')
    .attr('height', size.height)
    .attr('width', size.width);
  container.append('p').text('Chart: Stella Jia / Daily Nexus');
  // uncomment:: needs y axis
  // this creates a group (g) for each letter and moves them so they are positioned correctly
  const letters = svg
    .selectAll('groups')
    .data(grouped)
    .enter()
    .append('g')
    .attr('transform', (d) => {
      return `translate(0, ${y(d.key)})`;
    });

  // because of the translation above ^, the positioning is relative to each group,
  // so just use the `z` scale since we positioned the groups according to the y already (we wont need y anymore)
  // and use the x scale like normal
  const colors = {
    pre: '#a8bdd3',
    post: '#4e79a7',
  };

  letters
    .selectAll('bars')
    .data((d) => {
      return d.values;
    })
    .enter()
    .append('rect')
    .attr('y', (d) => {
      return z(d.when);
    })
    .attr('height', z.bandwidth())
    .attr('x', x(0))
    .attr('width', (d) => {
      return x(d.pct) - x(0);
    })
    .attr('fill', (d) => {
      return colors[d.when];
    })
    .on('mouseenter', (event, d) => {
      svg
        .append('text')
        .attr('x', x(d.pct))
        .attr('y', y(d.letter) + z(d.when) + z.bandwidth() / 2 + 1)
        .attr('alignment-baseline', 'middle')
        .text(`${Math.round(d.pct * 100)}%`);
    });

  // add the bars here

  // create a JS object (size, margin are objects) called 'color' with keys: 'pre', 'post' and values for colors like 'blue','red'
  // color the bars above ^ according to this object.
  // use square brackets to access a dictionary key when the value is in a variable (as opposed to .width which would be fixed text

  // use the `axis bottom` snippet to add an x-scale at the bottom
  svg
    .append('g')
    .style('color', '#adadad')
    .style('font-size', '12pt')
    .attr('transform', `translate(0, ${size.height - margin.bottom})`)
    .call(
      axisBottom()
        .scale(x)
        .ticks(5)
        .tickFormat((d, i) => {
          return d * 100 + (i === 6 ? '%' : '');
        }),
    );

  svg
    .append('text')
    .attr('fill', '#adadad')
    .attr('text-anchor', 'end')
    .attr('x', size.width - margin.right)
    .attr('y', size.height - 5)
    .text('% All letter grades');

  // just start typing `axis bottom`... and select the option
  // position this so words aren't cut off

  // add text to the left of each bar:
  letters
    .append('text')
    .text((d) => {
      return d.key;
    })
    .attr('y', y.bandwidth() / 2)
    .attr('x', 10);
  // start with svg and use the uniqueLetters array
  // position the text using the y-scale -- the center of each group is at y(d.key) + y.bandwidth() / 2
  // use the alignment-baseline attr with value of `middle` to line the text up vertically
  // for the x-value do something like x(0) - 5 (or however much you need)

  // adds arrows instead of legend
  // arrow for pre covid
  svg
    .append('svg:defs')
    .append('svg:marker')
    .attr('id', 'pre-grade-report-bar-chart-triangle')
    .attr('refX', 4)
    .attr('refY', 2)
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M 4 0 0 2 4 4')
    .attr('fill', colors.pre);
  svg
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', colors.pre)
    .attr('stroke-width', 2)
    .attr('marker-start', 'url(#pre-grade-report-bar-chart-triangle)')
    .attr(
      'd',
      `M ${x(0.345) + 10} ${y('B') + 10} Q ${x(0.345) + 20} ${y('B') + 5}, ${
        x(0.345) + 40
      } ${y('B') + 12}`,
    );

  svg
    .append('text')
    .text("Before Winter '21")
    .attr('x', x(0.345) + 20)
    .attr('y', y('B') + 28);

  // arrow for post covid
  svg
    .append('svg:defs')
    .append('svg:marker')
    .attr('id', 'post-grade-report-bar-chart-triangle')
    .attr('refX', 4)
    .attr('refY', 2)
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M 4 0 0 2 4 4')
    .attr('fill', colors.post);

  svg
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', colors.post)
    .attr('stroke-width', 2)
    .attr('marker-start', 'url(#post-grade-report-bar-chart-triangle)')
    .attr(
      'd',
      `M ${x(0.26) + 10} ${y('B') + 43} Q ${x(0.26) + 25} ${y('B') + 48}, ${
        x(0.26) + 38
      } ${y('B') + 48}`,
    );

  svg
    .append('text')
    .text('After Winter 2021')
    .attr('x', x(0.26) + 40)
    .attr('y', y('B') + 55);

  // svg
  //   .append('line')
  //   .attr('stroke', '#00002b')
  //   .attr('stroke-width', 1.5)
  //   .attr('x1', x(0.33) + 106)
  //   .attr('x2', x(0.33) + 106)
  //   .attr('y1', 25)
  //   .attr('y2', 50);
  // svg
  //   .append('line')
  //   .attr('stroke', '#00002b')
  //   .attr('stroke-width', 1.5)
  //   .attr('x1', x(0.6) + 7)
  //   .attr('x2', x(0.6) + 7)
  //   .attr('y1', 25)
  //   .attr('y2', 50);
  // svg
  //   .append('line')
  //   .attr('stroke', '#00002b')
  //   .attr('stroke-width', 1.5)
  //   .attr('x1', x(0.33) + 106)
  //   .attr('x2', x(0.6) + 7)
  //   .attr('y1', 75 / 2)
  //   .attr('y2', 75 / 2);

  // svg
  //   .append('rect')
  //   .attr('x', x(0.33) + 120)
  //   .attr('y', 25)
  //   .attr('height', 25)
  //   .attr('width', 115)
  //   .attr('fill', 'white');
  // svg
  //   .append('text')
  //   .text("A's increase by")
  //   .attr('x', x(0.33) + 123)
  //   .attr('y', 31);
  // svg
  //   .append('text')
  //   .text('17% points')
  //   .attr('x', x(0.33) + 123)
  //   .attr('y', 45);
};

export default makePlot;
