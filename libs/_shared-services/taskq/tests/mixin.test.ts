import { createTaskQueue, createQueueMixin } from '../src';

const mockTask = async (input?: string) => {
  return `Processed ${input || 'input'}`;
};

const failingTask = async () => {
  throw new Error('Task failed because of..');
};

describe('QueueMixin', () => {
  it('should execute all queues sequentially', async () => {
    const queue1 = createTaskQueue('Queue1');
    queue1.addNextTask({ key: 'task1', task: mockTask });
    const queue2 = createTaskQueue('Queue2');
    queue2.addNextTask({ key: 'task2', task: mockTask });

    const mixin = createQueueMixin({ mode: 'sequential' });
    mixin.register([queue1, queue2]);

    const result = await mixin.start();

    expect(result.success).toBe(true);
    expect(queue1.getResult('task1')).toBe('Processed input');
    expect(queue2.getResult('task2')).toBe('Processed input');
  });

  it('should handle errors in sequential execution', async () => {
    const queue1 = createTaskQueue('Queue1');
    queue1.addNextTask({ key: 'task1', task: mockTask });

    const queue2 = createTaskQueue('Queue2');
    queue2.addNextTask({ key: 'failingTask', task: failingTask });

    const mixin = createQueueMixin({ mode: 'sequential', haltOnFailure: true });
    mixin.register([queue1, queue2]);

    const result = await mixin.start();

    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors![0].queueName).toBe('Queue2');
    expect(result.errors![0].error).toBe('Error in task "failingTask": Task failed because of..');
  });
});
