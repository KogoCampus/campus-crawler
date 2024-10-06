export type Task<TProps = void, TOutput = void> = (props: TProps) => TOutput | Promise<TOutput>;

export interface TaskConfig {
  maxTimeout?: number; // Maximum time allowed for a task to run (in milliseconds)
}

export interface TaskQueueConfig {
  verbose?: boolean;
  stallInterval?: number; // Time to stall between task execution (in milliseconds)
}

export interface TaskDefinition<TProps = void, TOutput = void> {
  key: string;
  task: Task<TProps, TOutput>;
  config?: TaskConfig;
}
