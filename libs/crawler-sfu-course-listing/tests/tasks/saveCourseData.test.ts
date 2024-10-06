import { ScrapeCourseTaskResult } from '../../src/tasks/scrapeCourse';
import { saveCourseDataTask, createBucketObjectKey } from '../../src/tasks/saveCourseData';
import S3Client from 's3client';

jest.mock('s3client'); // Mock the S3Client

describe('saveCourseDataTask', () => {
  let mockPutObject: jest.Mock;

  beforeEach(() => {
    // Reset all mocks before each test
    mockPutObject = jest.fn();
    (S3Client as jest.Mock).mockImplementation(() => {
      return {
        putObject: mockPutObject,
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save courses to S3 with the correct bucket key and data', async () => {
    // Mock Date to control the output of createBucketObjectKey
    const mockDate = new Date('2024-10-06T00:00:00Z');
    global.Date = jest.fn(() => mockDate) as unknown as DateConstructor;

    const courses = ['COMP 101', 'MATH 202'];
    const taskResult: ScrapeCourseTaskResult = { courses };

    await saveCourseDataTask.task(taskResult);

    // Check if putObject was called with the correct arguments
    const expectedKey = `simon-fraser-university/${createBucketObjectKey()}/courses.json`;
    const expectedBody = JSON.stringify(courses, null, 2);

    expect(mockPutObject).toHaveBeenCalledWith(expectedKey, expectedBody);
  });
});
