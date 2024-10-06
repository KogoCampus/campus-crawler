import { TaskDefinition } from 'taskq';
import S3Client from 's3client';
import { ScrapeCourseTaskResult } from './scrapeCourse';

export function createBucketObjectKey() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const date = String(today.getDate()).padStart(2, '0');

  return `${year}/${month}/${date}`;
}

export const saveCourseDataTask: TaskDefinition<ScrapeCourseTaskResult, void> = {
  key: 'saveCourseData',
  task: async ({ courses }) => {
    //await fs.writeFile('courses.json', JSON.stringify(courses, null, 2));
    const s3 = new S3Client();
    await s3.putObject(`simon-fraser-university/${createBucketObjectKey()}/courses.json`, JSON.stringify(courses, null, 2));

    console.log('Courses saved successfully');
  },
};
