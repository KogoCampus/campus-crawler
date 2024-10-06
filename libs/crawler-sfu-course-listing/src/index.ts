import { createTaskQueue, pipe } from 'taskq';
import { scrapeCourseTask } from './tasks/scrapeCourse';
import { saveCourseDataTask } from './tasks/saveCourseData';

const taskQueue = createTaskQueue('SFU Course Scraper', { verbose: true });

// Add tasks to the queue
// taskQueue.addNextTask(scrapeCourseTask);
// taskQueue.addNextTask(saveCourseDataTask);

taskQueue.addNextTask(pipe(scrapeCourseTask, saveCourseDataTask));

export { taskQueue };
