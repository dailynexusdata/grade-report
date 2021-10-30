import * as d3 from 'd3';

const makeArray = (courses) => {
  return Array.isArray(courses) ? courses : [courses];
};

export function getClass(courseName, data) {
  return data
    .filter(({ course }) => {
      return course === courseName;
    })
    .sort((a, b) => {
      return +a.year - +b.year;
    });
}

export function getProf(profName, data) {
  return data
    .filter(({ instructor }) => {
      return instructor === profName;
    })
    .sort((a, b) => {
      return +a.year - +b.year;
    });
}

export function stackGrades(courses) {
  courses = makeArray(courses);

  return courses.map((course) => {
    const output = { grades: {} };

    const gradeToWords = (x) => {
      const [letter, sym] = [x[0], x.split(/\w+/)[1]];
      switch (sym) {
        case '+':
          return [letter, 'plus'];
        case '-':
          return [letter, 'minus'];
        default:
          return [letter, 'normal'];
      }
    };
    let numStudents = 0;

    Object.entries(course).forEach(([key, value]) => {
      if (key.length <= 2) {
        const [letter, type] = gradeToWords(key);
        if (Object.keys(output.grades).includes(letter)) {
          output.grades[letter][type] = +value;
          output.grades[letter].total += +value;
        }
        else {
          output.grades[letter] = {
            [type]: +value,
            total: +value,
            letter,
          };
        }
        numStudents += +value;
      }
      else {
        output[key] = value;
      }
    });

    Object.values(output.grades).forEach((grade) => {
      grade.courseStudents = numStudents;
    });

    return output;
  });
}

export function getCourseNames(deptName, data) {
  // get all of the unique course names in a department

  // 1. Filter data to only look at rows with dept name
  // 2. For each loop through data rows to find all unique course names
  // 3. For each loop through unique course names, filter data by course name
  // add each filtered data to array
  const courseList = {};
  data
    .filter(({ dept }) => {
      return dept === deptName;
    })
    .forEach((course) => {
      if (Object.keys(courseList).includes(course.course)) {
        courseList[course.course].push(course);
      }
      else {
        courseList[course.course] = [course];
      }
    });

  return courseList;
}

export function getDepartmentPctGrades(grades, data) {
  grades = makeArray(grades); // either ["A"], ["A", "B", "C", "D", "P"] or ["F", "NP"]

  // get the total number of values in the grades array and the total number of grades given out by that department
  // do this for all departments over the entire time period
}

export function groupCourses(data) {
  const output = {};

  data.forEach((course) => {
    if (Object.keys(output).includes(course.course)) {
      output[course.course].push(course);
    }
    else {
      output[course.course] = [course];
    }
  });

  return output;
}

export function sortByCourseName([, a1], [, b1]) {
  // sorts course names by dept, by num then by letter
  const a = a1[0];
  const b = b1[0];

  if (a.dept === b.dept) {
    const [, anum, aletter] = a.num.match(/^(\d+)(.*)$/);
    const [, bnum, bletter] = b.num.match(/^(\d+)(.*)$/);
    return anum === bnum ? (aletter < bletter ? -1 : 1) : +anum - +bnum;
  }
  return a.dept < b.dept ? -1 : 1;
}

export function organizeByGrade(gradeData) {
  const allGrades = {};

  // setup allGrades with keys for every grade option
  Object.keys(gradeData[0].grades).forEach((letter) => {
    allGrades[letter] = [];
  });

  // sort each course into allGrades by grade
  gradeData.forEach((data) => {
    Object.entries(data.grades).forEach(([letter, grades]) => {
      allGrades[letter].push({ ...data, grades });
    });
  });

  const output = {};

  // filter out grades that were not assigned
  Object.entries(allGrades).forEach(([letter, allGrades]) => {
    const sum = allGrades.reduce((acc, g) => {
      return acc + +g.grades.total;
    }, 0);
    if (sum !== 0) {
      output[letter] = allGrades;
    }
  });

  return output;
}
