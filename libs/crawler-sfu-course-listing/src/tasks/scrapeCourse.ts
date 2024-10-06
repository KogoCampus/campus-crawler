import axios from 'axios';
import { TaskDefinition } from 'taskq';

export interface ScrapeCourseTaskResult {
  courses: string[]; // List of course names or IDs
}

export const scrapeCourseTask: TaskDefinition<void, ScrapeCourseTaskResult> = {
  key: 'scrapeCourse',
  task: async () => {
    console.log(`Scraping courses for term`);

    // Simulate scraping the course listing (replace with real scraping logic)
    //const response = await axios.get(`https://www.sfu.ca/outlines.html?term=${term}`);
    //const courses = response.data.match(/COURSE-[A-Z0-9]+/g) || []; // Example regex to extract course IDs
    const courses = ['CMPT-123', 'MATH-101', 'PHYS-101'];

    console.log(`Scraped ${courses.length} courses`);
    return { courses };
  },
};
