/**
 * Average number of courses per student / by quarter
 *
 * @author alex
 * @since 8/24/2021
 */
import { axisBottom } from 'd3-axis';
import { scaleLinear, scalePoint } from 'd3-scale';
import { line as d3line } from 'd3-shape';
import { select } from 'd3-selection';

const coursesPerStudent = (data) => {
  const container = select('#grade-report-coursespstudent');
  container.selectAll('*').remove();

  container.append('h1').text('Average # Courses Per Student');

  const size = {
    height: 300,
    width: Math.min(600, container.style('width').slice(0, -2)),
  };

  const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 25,
  };

  const svg = container
    .append('svg')
    .attr('height', size.height)
    .attr('width', size.width);

  const x = scalePoint()
    .domain(
      data.map((d) => {
        return d.quarter;
      }),
    )
    .range([margin.left, size.width - margin.right]);

  const y = scaleLinear()
    .domain([0, 5])
    .range([size.height - margin.bottom, margin.top]);

  const line = d3line()
    .x((d) => {
      return x(d.quarter);
    })
    .y((d) => {
      return y(d.cPerStudent);
    });

  svg
    .datum(data)
    .append('path')
    .attr('d', line)
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', 2);

  y.ticks(5)
    .slice(1)
    .forEach((yHeight) => {
      svg
        .append('line')
        .attr('x1', margin.left)
        .attr('x2', size.width - margin.right)
        .attr('y1', y(yHeight))
        .attr('y2', y(yHeight))
        .attr('stroke', '#adadad66')
        .attr('stroke-width', 0.5);

      svg
        .append('text')
        .text(yHeight + (yHeight === 5 ? ' courses per student' : ''))
        .attr('x', margin.left)
        .attr('y', y(yHeight) - 5)
        .attr('fill', '#d3d3d3');
    });

  const summerData = data.filter((d) => {
    return d.quarter.match(/Summer/);
  });

  const summers = svg
    .selectAll('g')
    .data(summerData)
    .join('g')
    .attr('fill', '#f28e2c');

  summers
    .append('circle')
    .attr('cx', (d) => {
      return x(d.quarter);
    })
    .attr('cy', (d) => {
      return y(d.cPerStudent);
    })
    .attr('r', 4);

  // make based on x,y
  svg
    .append('text')
    .text('Summer')
    .attr('x', x('Fall 2019') + 30)
    .attr('y', y(2.6))
    .attr('fill', '#f28e2c');
  svg
    .append('text')
    .text('quarters')
    .attr('x', x('Fall 2019') + 30)
    .attr('y', y(2.6) + 14)
    .attr('fill', '#f28e2c');

  summers
    .append('text')
    .text((d) => {
      return Math.round(d.cPerStudent * 100) / 100;
    })
    .attr('x', (d) => {
      return x(d.quarter) + 5;
    })
    .attr('y', (d) => {
      return y(d.cPerStudent);
    })
    .attr('alignment-baseline', 'hanging')
    .style('font-size', '14pt');

  svg
    .append('g')
    .attr('class', 'xaxis')
    .attr('transform', `translate(0, ${size.height - margin.bottom})`)
    .style('font-size', '16px')
    .attr('color', '#adadad')
    .call(
      axisBottom(x).tickFormat((d) => {
        return d.match(/Fall/) ? `Fall '${d.match(/\d{2}$/)}` : '';
      }),
    );

  summers
    .append('svg:defs')
    .append('svg:marker')
    .attr('id', 'triangleUpUpCPerStudents')
    .attr('refX', 4)
    .attr('refY', 2)
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M 4 0 0 2 4 4');

  const lastSummer = summerData[summerData.length - 1];
  const secondSummer = summerData[summerData.length - 2];

  summers
    .append('path')
    .attr(
      'd',
      `M ${x(lastSummer.quarter) - 12} ${y(lastSummer.cPerStudent) + 10} L ${
        x(secondSummer.quarter) + 10
      } ${y(secondSummer.cPerStudent) - 8}`,
    )
    .attr('fill', 'none')
    .attr('stroke-width', 2)
    .attr('stroke', '#f28e2c')
    .attr('marker-start', 'url(#triangleUpUpCPerStudents)');

  const data2020 = data.filter((d) => {
    return d.quarter.match(/(Fall 2019|(Winter|Spring) 2020)/);
  });

  const quar = svg
    .selectAll('g2020')
    .data(data2020)
    .join('g')
    .attr('fill', '#4e79a7');

  svg
    .append('text')
    .text('Year 2019-20')
    .attr('x', x('Winter 2020') + 30)
    .attr('y', y(4.85) + 14)
    .attr('fill', '#4e79a7');

  quar
    .append('circle')
    .attr('cx', (d) => {
      return x(d.quarter);
    })
    .attr('cy', (d) => {
      return y(d.cPerStudent);
    })
    .attr('r', 4);

  quar
    .append('text')
    .text((d) => {
      return Math.round(d.cPerStudent * 100) / 100;
    })
    .attr('x', (d) => {
      return x(d.quarter) + 5;
    })
    .attr('y', (d, i) => {
      return y(d.cPerStudent) + (i !== 2 ? -3 : 2);
    })
    .style('font-size', '14pt');

  quar
    .append('svg:defs')
    .append('svg:marker')
    .attr('id', 'triangleDownDownCPerStudents')
    .attr('refX', 4)
    .attr('refY', 2)
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M 4 0 0 2 4 4');

  const pStart = data2020[0];
  const pEnd = data2020[2];

  quar
    .append('path')
    .attr(
      'd',
      `M ${x(pEnd.quarter) + 25} ${y(pEnd.cPerStudent) - 25} L ${
        x(pStart.quarter) + 25
      } ${y(pStart.cPerStudent) - 25}`,
    )
    .attr('fill', 'none')
    .attr('stroke-width', 2)
    .attr('stroke', '#4e79a7')
    .attr('marker-start', 'url(#triangleDownDownCPerStudents)');

  container
    .append('p')
    .html(
      '<p>Source: <a href='
        + "'https://bap.ucsb.edu/institutional-research/registration-reports'>"
        + 'UCSB Office of Budget & Planning 3rd Week Census</a></p>',
    );
};

export default coursesPerStudent;
