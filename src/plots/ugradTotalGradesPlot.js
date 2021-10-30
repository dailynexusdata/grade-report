import * as d3 from 'd3';
import colors from './colors';

const size = {
  width: 600,
  height: 50, // when you set the size of the svg do size.height * (# of bars)
};

const margin = {
  left: 35,
  right: 20,
  top: 10,
  bottom: 30,
};
// Setting x for all svgs. Y's are calculated within each svg.

const x = d3.scaleLinear().domain([0, 1]).range([0, size.width]);

export default function ugradTotalGradesPlot(data) {
  const container = d3.select('#grade-report-ugradTotals');
  const title = container
    .append('h3')
    .html('Cumulative Grade Distribution in UCSB History');

  // Creating Array consisting only of letters and proportions
  const letters = data.filter(({ grade }) => {
    return ['A', 'B', 'C', 'D', 'F'].indexOf(grade) != -1;
  });

  const lettersSum = letters.reduce((a, b) => {
    return a + b.sum;
  }, 0);

  const letterProps = letters.map(({ grade, sum }) => {
    return {
      grade,
      pct: sum / lettersSum,
    };
  });

  // Creating Array consisting only of P/ NP and Proportions

  const pass_np = data.filter(({ grade }) => {
    return ['P', 'NP'].indexOf(grade) != -1;
  });
  const passSum = pass_np.reduce((a, b) => {
    return a + b.sum;
  }, 0);
  const passProps = pass_np.map(({ grade, sum }) => {
    return {
      grade,
      pct: sum / passSum,
    };
  });

  console.log(passProps);
  // X axis

  // Set Heights for svgs
  const letterHeight = size.height * Object.keys(letters).length;
  const svgLetterVsPNPBars = 1;
  const passHeight = size.height * Object.keys(pass_np).length;
  const lPNPHeight = size.height * svgLetterVsPNPBars;

  /// ////// Letters vs PNP SVG  ///////////////////
  const svgLetterVsPNP = container.append('svg');
  // 1. Create a Dictionary of Proportions PassLettersProps = e.g. {"Letters": 0.89, "PNP": .11}
  // 2. Create array of x locations defined by x[0] = 0, x[1] = PassLettersProps.Letters
  // 3. Create regular svg defined by y and x_array
  const totalSum = data.reduce((a, b) => {
    return a + b.sum;
  }, 0);

  const lPNPData = [
    { type: 'Letters', prop: lettersSum / totalSum, leftX: 0 },
    {
      type: 'PNP',
      prop: 1 - lettersSum / totalSum,
      leftX: lettersSum / totalSum,
    },
  ];
  svgLetterVsPNP
    .attr('width', size.width + margin.left + margin.right)
    .attr('height', lPNPHeight + margin.bottom + margin.top)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  svgLetterVsPNP
    .append('g')
    .attr('class', 'xaxis')
    .attr('transform', `translate(0, ${lPNPHeight + margin.top + 5})`)
    .style('font-family', 'Helvetica Neue,Helvetica,Arial,sans-serif')
    .style('font-size', '16px')
    .attr('color', '#adadad')
    .call(
      d3
        .axisBottom(x)
        .ticks(5)
        .tickFormat((d) => {
          return `${Math.round(d * 100)}${d === 1 ? '%' : ''}`;
        }),
    );

  const rect_colors = { Letters: '#69b3a2', PNP: '#ffa600' };
  svgLetterVsPNP
    .selectAll('myRect_letters')
    .data(lPNPData)
    .enter()
    .append('rect')
    .attr('x', (d) => {
      return x(d.leftX);
    })
    .attr('y', 0)
    .attr('width', (d) => {
      return x(d.prop);
    })
    .attr('height', 40)
    .attr('fill', (d) => {
      return rect_colors[d.type];
    });

  /// //// End Letters vs PNP SVG ////////////
  container.append('h3').html('Distribution of Letter Grades');
  const svgLetter = container
    .append('svg')
    .attr('width', size.width + margin.left + margin.right)
    .attr('height', letterHeight + margin.bottom + margin.top)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  svgLetter
    .append('g')
    .attr('class', 'xaxis')
    .attr('transform', `translate(0, ${letterHeight + margin.top})`)
    .style('font-family', 'Helvetica Neue,Helvetica,Arial,sans-serif')
    .style('font-size', '16px')
    .attr('color', '#adadad')
    .call(
      d3
        .axisBottom(x)
        .ticks(5)
        .tickFormat((d) => {
          return `${Math.round(d * 100)}${d === 1 ? '%' : ''}`;
        }),
    );

  // Y axis
  const yL = d3
    .scaleBand()
    .range([0, letterHeight])
    .domain(
      letterProps.map((d) => {
        return d.grade;
      }),
    )
    .padding(0.1);
  svgLetter.append('g').call(d3.axisLeft(yL));

  svgLetter
    .selectAll('myRect_letters')
    .data(letterProps)
    .enter()
    .append('rect')
    .attr('x', x(0))
    .attr('y', (d) => {
      return yL(d.grade);
    })
    .attr('width', (d) => {
      return x(d.pct);
    })
    .attr('height', yL.bandwidth())
    .attr('fill', (d) => {
      if (d.grade === 'F') {
        return '#E15759';
      }
      return '#E5E5E5';
    });

  d3.axisBottom(x);
  container.append('h3').html('Distribution of P/NP Grades');

  const svgPNP = container
    .append('svg')
    .attr('width', size.width + margin.left + margin.right)
    .attr('height', passHeight + margin.bottom + margin.top)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  svgPNP
    .append('g')
    .attr('class', 'xaxis')
    .attr('transform', `translate(0, ${passHeight + margin.top})`)
    .style('font-family', 'Helvetica Neue,Helvetica,Arial,sans-serif')
    .style('font-size', '16px')
    .attr('color', '#adadad')
    .call(
      d3
        .axisBottom(x)
        .ticks(5)
        .tickFormat((d) => {
          return `${Math.round(d * 100)}${d === 1 ? '%' : ''}`;
        }),
    );

  // Y axis for PNP SVG (X axis same as first graph)
  const yPNP = d3
    .scaleBand()
    .range([0, passHeight])
    .domain(
      passProps.map((d) => {
        return d.grade;
      }),
    )
    .padding(0.1);

  svgPNP.append('g').call(d3.axisLeft(yPNP));

  svgPNP
    .selectAll('myRect_letters')
    .data(passProps)
    .enter()
    .append('rect')
    .attr('x', x(0))
    .attr('y', (d) => {
      return yPNP(d.grade);
    })
    .attr('width', (d) => {
      return x(d.pct);
    })
    .attr('height', yPNP.bandwidth())
    .attr('fill', (d) => {
      if (d.grade === 'NP') {
        return '#E15759';
      }
      return '#E5E5E5';
    });
}

// ffa600 contrasts well with 69b3a2
