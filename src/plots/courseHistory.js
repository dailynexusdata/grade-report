/**
 * Average number of courses per student / by quarter
 *
 * @author alex
 * @since 8/24/2021
 */

import { axisBottom, axisLeft } from 'd3-axis';
import { scaleLinear, scalePoint } from 'd3-scale';
import { interpolatePath } from 'd3-interpolate-path';
import { select } from 'd3-selection';
import { area as d3area } from 'd3-shape';

import { getClass, organizeByGrade, stackGrades } from './aggregations';
import colors from './colors';

const getMaxCourse = (panelData) => {
  const output = {};

  panelData.forEach((data) => {
    const key = `${data.quarter} ${data.year}`;
    if (Object.keys(output).includes(key)) {
      output[key] =
        output[key].grades.total / output[key].grades.courseStudents
        > data.grades.total / data.grades.courseStudents
          ? output[key]
          : data;
    }
    else {
      output[key] = data;
    }
  });

  return Object.values(output);
};

export default function courseHistory(course, data) {
  const container = select('#grade-report-courseGrades');

  const size = {
    width: Math.min(600, window.innerWidth - 40),
    height: 120,
  };
  const panelPadding = {
    left: 30,
    right: 20,
    top: 20,
    bottom: 10,
  };

  const margin = {
    left: 30,
    right: 10,
    top: 0,
    bottom: 30,
  };

  container
    .selectAll('.courseTitle')
    .data([course])
    .join(
      (enter) => {
        const div = enter
          .append('div')
          .attr('class', 'courseTitle')
          .style('font-family', 'Helvetica Neue,Helvetica,Arial,sans-serif');

        div
          .append('h1')
          .html('Grading History for&nbsp;')
          .style('margin-bottom', 0)
          .style('display', 'inline');

        div
          .append('h1')
          .attr('class', 'title')
          .style('margin-bottom', 0)
          .transition()
          .duration(1000)
          .style('opacity', 0)
          .style('display', 'inline')
          .transition()
          .duration(1000)
          .style('opacity', 1)
          .text((d) => {
            return d;
          });
      },
      (update) => {
        update
          .selectAll('.title')
          .transition()
          .duration(1000)
          .style('opacity', 0)
          .remove();

        update
          .append('h1')
          .attr('class', 'title')
          .style('margin-bottom', 0)
          .transition()
          .duration(1000)
          .style('opacity', 0)
          .style('display', 'inline')
          .transition()
          .duration(1000)
          .style('opacity', 1)
          .text((d) => {
            return d;
          });
      },
    );

  const extraLabels = container
    .selectAll('.course-history-extra-labels')
    .data([1])
    .enter()
    .append('div')
    .attr('class', 'course-history-extra-labels');

  extraLabels
    .append('p')
    .text(
      'Some courses had sudden changes to their grading distribution when online instruction began, while other courses, in the same departments, did not.',
    );

  extraLabels
    .append('p')
    .html('% of grades given out each quarter')
    .style('color', '#adadad')
    .style('margin-bottom', 0)
    .style('display', 'inline');

  //

  // const inputArea = select('#courseInputArea');

  // if (inputArea.empty()) {
  //   const inputA = container.append("div").attr("id", "courseInputArea");
  //   const input = inputA
  //     .append("input")
  //     .attr("id", "course-choice")
  //     .attr("list", "courseList")
  //     .attr("name", "course-choice");

  //   inputA.append("datalist").attr("id", "courseList");

  //   input.on("input", (event) => {
  //     const val = event.target.value;
  //     updateInputArea(val);
  //   });
  // }

  // const updateInputArea = (val) => {
  //   container
  //     .select("#courseList")
  //     .selectAll("option")
  //     .data(
  //       getWords(
  //         data,
  //         val,
  //         (d) => d.dept,
  //         (d) => d.course
  //       )
  //     )
  //     .join(
  //       (enter) => {
  //         enter.append("option").attr("value", (d) => d);
  //       },
  //       (update) => {
  //         update.attr("value", (d) => d);
  //       }
  //     );
  // };
  // updateInputArea("");

  const plotData = organizeByGrade(stackGrades(getClass(course, data)));

  const totalHeight =
    size.height * Object.keys(plotData).length + margin.top + margin.bottom;

  if (container.selectAll('svg').nodes().length === 0) {
    container.append('svg');
  }

  container.style('width', `${size.width}px`);
  const svg = container.selectAll('svg').attr('width', size.width);
  svg.transition().duration(1000).attr('height', totalHeight);

  const y = (i) => {
    return scaleLinear().range([
      margin.top + size.height * (i + 1) - panelPadding.bottom,
      panelPadding.top + margin.top + size.height * i,
    ]);
  };

  svg
    .selectAll('.yAxis')
    .data(Object.keys(plotData))
    .join(
      (enter) => {
        enter
          .append('g')
          .attr('class', 'yAxis')
          .style('font-size', '16px')
          .attr(
            'transform',
            `translate(${panelPadding.left + margin.left - 10}, 0)`,
          )
          .attr('color', '#adadad')
          .each(function (d, i) {
            select(this).call(
              axisLeft(y(i))
                .ticks(1)
                .tickFormat((d) => {
                  return `${Math.round(d * 100)}${d === 1 ? '%' : ''}`;
                }),
            );
          });
      },
      (update) => {
        update.each(function (d, i) {
          select(this).call(
            axisLeft(y(i))
              .ticks(3)
              .tickFormat((d) => {
                return `${Math.round(d * 100)}${d === 1 ? '%' : ''}`;
              }),
          );
        });
      },
      (exit) => {
        return exit.remove();
      },
    );

  svg
    .selectAll('.ylines')
    .data(Object.keys(plotData))
    .enter()
    .append('g')
    .attr('class', 'yAxis')
    .selectAll('.ylines')
    .data((d, i) => {
      return [0, 0.5, 1].map((d) => {
        return { i, d };
      });
    })
    .enter()
    .append('line')
    .attr('class', 'ylines')
    .attr('x1', margin.left + panelPadding.left)
    .attr('x2', size.width - margin.right - panelPadding.right)
    .attr('y1', (d) => {
      return y(d.i)(d.d);
    })
    .attr('y2', (d) => {
      return y(d.i)(d.d);
    })
    .attr('stroke', '#d3d3d366')
    .lower();

  svg
    .selectAll('.yLabel')
    .data(Object.keys(plotData))
    .join(
      (enter) => {
        enter
          .append('text')
          .text((d) => {
            return d;
          })
          .attr('class', 'yLabel')
          .attr('alignment-baseline', 'middle')
          .attr('x', 1)
          .attr('y', (d, i) => {
            return y(i)(0.5);
          });
      },
      (update) => {
        update
          .text((d) => {
            return d;
          })
          .attr('y', (d, i) => {
            return y(i)(0.5);
          });
      },
      (exit) => {
        return exit.remove();
      },
    );
  const quarters = [
    ...new Set(
      Object.values(plotData)[0].map(({ quarter, year }) => {
        return `${quarter} ${year}`;
      }),
    ),
  ];

  const x = scalePoint()
    .domain(quarters)
    .range([
      panelPadding.left + margin.left,
      size.width - panelPadding.right - margin.right,
    ]);

  const area = (i) => {
    return d3area()
      .x((d) => {
        return x(`${d.quarter} ${d.year}`);
      })
      .y0(y(i)(0))
      .y1((d) => {
        return y(i)(d.grades.total / d.grades.courseStudents);
      });
  };

  // const gradeColors = ['#4e79a7', '#76b7b2', '#edc949', '#f28e2c', '#e15759'];
  // gradeColors.forEach((color, i) => {
  //   const gradient = defs
  //     .append('linearGradient')
  //     .attr('id', `svgGradient-${i}`)
  //     .attr('x1', '0%')
  //     .attr('y1', '0%')
  //     .attr('x2', '100%')
  //     .attr('y2', '0%');
  //   gradient
  //     .append('stop')
  //     .attr('offset', '90%')
  //     .attr('stop-color', color)
  //     .attr('stop-opacity', 0.15);
  //   gradient
  //     .append('stop')
  //     .attr('offset', '90%')
  //     .attr('stop-color', color)
  //     .attr('stop-opacity', 0.5);
  // });

  svg
    .selectAll('.sparkLines')
    .data(
      Object.values(plotData).map((d) => {
        return getMaxCourse(d);
      }),
    )
    .join(
      (enter) => {
        enter
          .append('path')
          .attr('class', 'sparkLines')
          .transition()
          .duration(1000)
          .attr('d', (d, i) => {
            return area(i)(d);
          })
          .attr('fill', (d) => {
            return colors.grades[d[0].grades.letter];
          })
          // .attr('fill', (d, i) => {
          //   return `url(#svgGradient-${i})`;
          // });
          .attr('fill-opacity', 0.3);

        enter.raise();
      },
      (update) => {
        update
          .transition()
          .duration(500)
          .attrTween('d', function (d, i) {
            const prev = select(this).attr('d');
            const curr = area(i)(d);
            return interpolatePath(prev, curr);
          });

        update.raise();
      },
    );

  svg
    .selectAll('.courseBubbles')
    .data(
      Object.values(plotData).reduce((acc, curr) => {
        return [...acc, ...curr];
      }, []),
    )
    .join(
      (enter) => {
        enter
          // .filter((d) => +d.year >= 2020)
          .append('circle')
          .attr('class', 'courseBubbles')
          .attr('cx', (d) => {
            return x(`${d.quarter} ${d.year}`);
          })
          .attr('cy', (d) => {
            return y(Object.keys(plotData).indexOf(d.grades.letter))(
              d.grades.total / d.grades.courseStudents,
            );
          })
          .on('mousemove', (_, d) => {
            // console.log(d.grades.total / d.grades.courseStudents);
          })
          .transition()
          .duration(1000)
          .attr('r', (d) => {
            return d.grades.total > 0 ? 3 : 0;
          })
          .attr('stroke', (d) => {
            return colors.grades[d.grades.letter];
          })
          .attr('stroke-width', 2)
          .attr('fill', (d) => {
            return colors.grades[d.grades.letter];
          })
          .attr('fill-opacity', 0.5);
      },
      (update) => {
        update
          .attr('cx', (d) => {
            return x(`${d.quarter} ${d.year}`);
          })
          .attr('cy', (d) => {
            return y(Object.keys(plotData).indexOf(d.grades.letter))(
              d.grades.total / d.grades.courseStudents,
            );
          })
          .attr('stroke', (d) => {
            return colors.grades[d.grades.letter];
          })
          .attr('fill', (d) => {
            return colors.grades[d.grades.letter];
          });

        // update.filter((d) => +d.year < 2020).remove();

        update
          .transition()
          .duration(1000)
          .attr('r', (d) => {
            return d.grades.total > 0 ? 3 : 0;
          });
      },
      (exit) => {
        return exit
          .transition()
          .duration(500)
          .attr('stroke-opacity', 0)
          .attr('fill-opacity', 0)
          .remove();
      },
    );

  svg
    .selectAll('.xaxis')
    .transition()
    .duration(500)
    .style('opacity', 0)
    .remove();

  const quarterAbbr = {
    Summer: 'M',
    Spring: 'S',
    Fall: 'F',
    Winter: 'W',
  };

  const labels = [];

  let lastYear = 0;
  quarters.forEach((d, i) => {
    const currentYear = +d.split(' ')[1].substr(-2);
    let lab = quarterAbbr[d.split(' ')[0]];

    if (lastYear !== currentYear) {
      lab += ` '${currentYear}`;
      lastYear = currentYear;
    }

    labels.push(lab);
  });

  svg
    .append('g')
    .attr('class', 'xaxis')
    .attr('transform', `translate(0, ${totalHeight - margin.bottom})`)
    .style('font-family', 'Helvetica Neue,Helvetica,Arial,sans-serif')
    .style('font-size', '16px')
    .attr('color', '#adadad')
    .call(
      axisBottom(x).tickFormat((d, i) => {
        // console.log('VA', d);
        return labels[i];
      }),
    );

  // svg.on("mousemove", (event) => {
  //   const mouse = d3.pointer(event);
  //   const range = x.range();
  //   const rangePoints = d3.range(range[0], range[1], x.step());
  //   const pos = x.domain()[d3.bisectCenter(rangePoints, mouse[0], -1)];

  //   svg.selectAll(".vertLines").remove();
  //   svg
  //     .append("line")
  //     .attr("class", "vertLines")
  //     .attr("x1", x(pos))
  //     .attr("x2", x(pos))
  //     .attr("y1", totalHeight - margin.bottom)
  //     .attr("y2", margin.top)
  //     .attr("stroke", "black")
  //     .attr("stroke-width", 2);
  // });

  container
    .selectAll('.legendDesc')
    .data([1])
    .enter()
    .append('p')
    .attr('class', 'legendDesc')
    .style('text-align', 'right')
    // .text('Quarter Abbreviations: F - Fall, S - Spring')
    .html(
      'Quarter Abbreviations:<wbr> F - Fall,<wbr> W - Winter,<wbr> S - Spring,<wbr> M - Summer'.replace(
        / /g,
        '&nbsp;',
      ),
    )
    .style('color', '#adadad');
}
