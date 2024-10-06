import { TaskQueue, TaskExecutionError } from './queue';

interface QueueMixinConfig {
  mode?: 'sequential' | 'parallel';
  haltOnFailure?: boolean; // Halt all queues if one task fails
  verbose?: boolean;
}

interface QueueError {
  queueName: string;
  error: string;
}

interface QueueMixinExecutionResult {
  success: boolean;
  errors?: QueueError[];
}

export class QueueMixin {
  private queues: TaskQueue[];
  private config: QueueMixinConfig;

  constructor({ mode = 'sequential', haltOnFailure = true, verbose = false }: QueueMixinConfig = {}) {
    this.config = {
      mode,
      haltOnFailure,
      verbose,
    };
  }

  register(queues: TaskQueue[]): void {
    this.queues = queues;
  }

  async start(): Promise<QueueMixinExecutionResult> {
    if (this.config.mode === 'sequential') {
      return await this.executeSequential();
    } else {
      return await this.executeParallel();
    }
  }

  // Sequential execution
  private async executeSequential(): Promise<QueueMixinExecutionResult> {
    if (!this.queues) throw Error('No queues registered');

    const result: QueueMixinExecutionResult = { success: true, errors: [] };

    for (const queue of this.queues) {
      try {
        await queue.executeAll();
      } catch (error) {
        result.success = false;
        result.errors?.push({ queueName: queue.getName(), error: (error as TaskExecutionError).message });
        if (this.config.haltOnFailure) break; // Halt on failure if configured
      }
    }

    return result.errors?.length ? result : { success: true };
  }

  // Round-robin parallel execution
  private async executeParallel(): Promise<QueueMixinExecutionResult> {
    if (!this.queues) throw Error('No queues registered');

    throw Error('TODO');
  }
}

export const createQueueMixin = (config: QueueMixinConfig): QueueMixin => {
  return new QueueMixin(config);
};
