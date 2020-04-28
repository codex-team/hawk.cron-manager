/**
 * Cron manager configuration object
 */
export interface CronManagerConfig {
  /**
   * RabbitMQ connection URL
   */
  registryUrl: string;

  /**
   * RabbitMQ exchange name (cron-tasks by default)
   */
  exchangeName?: string;

  /**
   * Task list to manage
   */
  tasks: CronManagerTask[];
}

/**
 * Task representation
 */
export interface CronManagerTask {
  /**
   * Worker type to add tasks (equal to the Registry queue name)
   */
  workerType: string;

  /**
   * Cron-like schedule string
   */
  schedule: string;

  /**
   * Any data to send with task
   */
  payload?: object;
}
