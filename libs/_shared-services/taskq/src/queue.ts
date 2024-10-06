import Logger from 'logger';
import { TaskDefinition, TaskQueueConfig } from './types';

export const pipe = <TProps, TOutput1, TOutput2>(
  task1: TaskDefinition<TProps, TOutput1>,
  task2: TaskDefinition<TOutput1, TOutput2>,
  config: TaskDefinition['config'] = {},
): TaskDefinition<TProps, TOutput2> => {
  return {
    key: `${task1.key} -> ${task2.key}`,
    task: async (props: TProps) => {
      const result = await task1.task(props);
      return await task2.task(result);
    },
    config: config,
  };
};

export class TaskExecutionError extends Error {
  constructor(taskKey: string, message: string, originalError: Error) {
    super(`Error in task "${taskKey}": ${message}`);
    this.name = 'TaskExecutionError';
    this.stack = originalError.stack;
  }
}

export class TaskQueue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private tasks: TaskDefinition<any, any>[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private results: Record<string, any> = {};
  private config: TaskQueueConfig;
  private name: string;
  private logger = Logger;

  constructor(name: string, { verbose = true, stallInterval = 0 }: TaskQueueConfig = {}) {
    this.name = name;
    this.config = { verbose, stallInterval };
  }

  addNextTask<TProps, TOutput>(definition: TaskDefinition<TOutput, TProps>): void {
    this.tasks.push(definition);
  }

  // Execute tasks in sequence
  async executeAll(): Promise<void> {
    let lastResult: unknown;
    let taskIndex = 0;

    const totalStartTime = performance.now();
    this.logger.info(`Starting ${this.tasks.length} queued tasks`);

    for (const queuedTask of this.tasks) {
      this.logger.info(`Executing task #${taskIndex + 1}/${this.tasks.length}: ${queuedTask.key}`);

      try {
        const taskStartTime = performance.now();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const execFn = queuedTask.task;
        this.results[queuedTask.key] = await execFn(lastResult);

        const taskEndTime = performance.now();
        const taskExecutionTime = taskEndTime - taskStartTime;
        this.logger.debug(`Task #${taskIndex + 1}/${this.tasks.length} execution result: ${this.results[queuedTask.key] ?? 'void'}`);
        this.logger.debug(`Task #${taskIndex + 1}/${this.tasks.length} completed: ${queuedTask.key} in ${taskExecutionTime} milliseconds`);

        if (this.config.stallInterval) {
          await new Promise(resolve => setTimeout(resolve, this.config.stallInterval));
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        this.logger.error(`Task #${taskIndex + 1}/${this.tasks.length} failed: ${queuedTask.key} - ${error.message}`);
        this.logger.error(error.stack);
        throw new TaskExecutionError(queuedTask.key, error.message, error);
      }
      taskIndex++;
    }

    const totalEndTime = performance.now();
    const totalExecutionTime = totalEndTime - totalStartTime;
    this.logger.info(`Task queue completed in ${totalExecutionTime} milliseconds.`);
  }

  // Get the latest result of a specific task by key
  getResult<T>(taskKey: string): T {
    return this.results[taskKey];
  }

  // Get the queue name
  getName(): string {
    return this.name;
  }
}

export const createTaskQueue = (name: string, config?: TaskQueueConfig): TaskQueue => {
  return new TaskQueue(name, config);
};
