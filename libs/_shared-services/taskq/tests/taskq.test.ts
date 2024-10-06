import { TaskDefinition } from '../dist';
import { createTaskQueue, TaskExecutionError, pipe } from '../src';

// Mock Task
const mockTask = async (input?: string) => {
  return `Processed ${input || 'input'}`;
};

const failingTask = async () => {
  throw new Error('Task failed');
};

describe('TaskQueue', () => {
  it('should execute tasks in sequence', async () => {
    const queue = createTaskQueue('TestQueue');

    queue.addNextTask({
      key: 'task1',
      task: async () => 'Task 1 result',
    });
    queue.addNextTask({
      key: 'task2',
      task: async () => `Task 2 result`,
    });

    await queue.executeAll();

    expect(queue.getResult('task1')).toBe('Task 1 result');
    expect(queue.getResult('task2')).toBe('Task 2 result');
  });

  it('should handle task execution errors', async () => {
    const queue = createTaskQueue('ErrorQueue');

    queue.addNextTask({
      key: 'task1',
      task: mockTask,
    });
    queue.addNextTask({
      key: 'failingTask',
      task: failingTask,
    });

    try {
      await queue.executeAll();
    } catch (error) {
      expect(error).toBeInstanceOf(TaskExecutionError);
      expect((error as TaskExecutionError).message).toBe('Error in task "failingTask": Task failed');
    }
  });

  it('should support task pipelines', async () => {
    const queue = createTaskQueue('PipelineQueue');

    const task1: TaskDefinition<void, string> = {
      key: 'task1',
      task: async () => 'Task 1 result',
    };
    const task2: TaskDefinition<string, string> = {
      key: 'task2',
      task: async input => `Task 2 received (${input})`,
    };
    const pipedTask = pipe(task1, task2);

    queue.addNextTask(task1);
    queue.addNextTask(pipedTask);

    await queue.executeAll();

    expect(queue.getResult('task1')).toBe('Task 1 result');
    expect(queue.getResult('task1 -> task2')).toBe('Task 2 received (Task 1 result)');
  });

  it('should support stalled task execution', async () => {
    const queue = createTaskQueue('StalledQueue', { stallInterval: 100 });

    const start = Date.now();
    const task1: TaskDefinition<void, string> = {
      key: 'task1',
      task: async () => 'Task 1 result',
    };
    const task2: TaskDefinition<string, string> = {
      key: 'task2',
      task: async input => `Task 2 received (${input})`,
    };

    queue.addNextTask(task1);
    queue.addNextTask(task2);

    await queue.executeAll();

    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(200); // Check if the stall interval was applied
  });
});
