import express from 'express';
import dotenv from 'dotenv';
import { taskQueue as sfuCrawlTaskQueue } from 'crawler-sfu-course-listing';
import { createQueueMixin } from 'taskq';

dotenv.config();

const mixin = createQueueMixin({ mode: 'sequential' });
mixin.register([sfuCrawlTaskQueue]);

// Express setup to trigger queue mixin execution
const app = express();
const port = process.env.PORT || 3000;

app.post('/run-tasks', async (req, res) => {
  await mixin.start();
  res.send('All tasks executed.');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
