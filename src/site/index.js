/**
 * @file
 * @author
 * @since
 */
import './styles.scss';
import { csv } from 'd3-fetch';

// import other files here
import makeCoursesPerStudent from '../plots/coursesPerStudent';
import ugradTotalGradesPlot from '../plots/ugradTotalGradesPlot';
import makeCourseHistoryPlot from '../plots/courseHistory';
import stellaPlot from '../plots/stella';

(async () => {
  // Import CSV File
  const coursesPerStudent = await csv(
    'dist/data/coursesPerStudent.csv',
    (d) => {
      return {
        ...d,
        cPerStudent: +d.cPerStudent,
      };
    },
  );

  const ugradData = await csv('dist/data/ugradTotalGrades.csv', (d) => {
    return {
      ...d,
      sum: +d.sum,
    };
  });
  // Import JSON file
  //   const data = json('dist/data/_____.json');
  const stellaData = await csv('dist/data/stella_data.csv', (d) => {
    return { ...d, pct: +d.pct };
  });
  const data = await csv('dist/data/courseGrades.csv');
  const courses = [
    // 'MCDB 1B',
    'EEMB 2',
    'EEMB 3',
    'ECON 1',
    'ECON 2',
    'PHYS 1',
    'PHYS 2',
    // 'DANCE 45',
  ];

  console.log(
    JSON.stringify(
      data.filter((d) => {
        return courses.includes(d.course);
      }),
    ),
  );

  let courseCycleIdx = 0;
  let courseCycleInterval = null;

  const createCourseCycleInterval = () => {
    clearInterval(courseCycleInterval);
    return setInterval(() => {
      ++courseCycleIdx;
      if (courseCycleIdx === courses.length) {
        courseCycleIdx = 0;
      }
      makeCourseHistoryPlot(courses[courseCycleIdx], data);
    }, 5000);
  };

  const resize = () => {
    // ugradTotalGradesPlot(ugradData);
    makeCoursesPerStudent(coursesPerStudent);
    makeCourseHistoryPlot(courses[courseCycleIdx], data);

    stellaPlot(stellaData);
    // UNDO TO CYCLE BETWEEN:
    courseCycleInterval = createCourseCycleInterval();
  };

  window.addEventListener('resize', () => {
    resize();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      courseCycleInterval = createCourseCycleInterval();
    }
    else {
      clearInterval(courseCycleInterval);
    }
  });

  resize();
})();
