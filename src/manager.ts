import { CronJob } from 'cron';
import amqp from 'amqplib';
import { CronManagerConfig } from './types';
import { Validator } from 'jsonschema';
import configSchema, { taskSchema } from './configSchema';

/**
 * Cron manager for adding tasks for some workers to RabbitMQ due to schedule
 */
export default class CronManager {
  /**
   * Jobs store
   */
  private readonly jobs: CronJob[] = [];

  /**
   * RabbitMQ exchange name (cron-tasks by default)
   */
  private readonly exchangeName: string;

  /**
   * Connection to Registry
   */
  private registryConnection?: amqp.Connection;

  /**
   * Registry Endpoint
   */
  private readonly registryUrl: string;

  /**
   * Channel is a "transport-way" between Consumer and Registry inside the connection
   * One connection can has several channels.
   */
  private channelWithRegistry?: amqp.Channel;

  /**
   * Creates manager instance
   *
   * @param config - configuration for jobs initialization
   */
  constructor(config: CronManagerConfig) {
    this.registryUrl = config.registryUrl;
    this.exchangeName = config.exchangeName || 'cron-tasks';
    const validator = new Validator();

    validator.addSchema(taskSchema);
    const validationResult = validator.validate(config, configSchema);

    if (validationResult.errors.length > 0) {
      validationResult.errors.forEach(error => console.error(error));
      throw new Error('Config is invalid');
    }

    config.tasks.forEach(task => {
      const job = new CronJob(task.schedule, async () => {
        await this.addTask(task.routingKey, task.payload || {});
        console.log(`[Cron-manager] ${new Date()} Added task for routing key ${task.routingKey}`);
      });

      this.jobs.push(job);
    });
  }

  /**
   * Adds task to other worker
   *
   * @param routingKey - worker's name
   * @param payload - payload object
   */
  public async addTask(routingKey: string, payload: object): Promise<boolean> {
    if (!this.channelWithRegistry) {
      throw new Error('Can\'t send task to the queue because there is no connection to the Registry');
    }

    return this.channelWithRegistry.publish(
      this.exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(payload))
    );
  }

  /**
   * Starts all jobs and setup registry connection
   */
  public async start(): Promise<void> {
    await this.connect();
    this.jobs.forEach(job => job.start());
  }

  /**
   * Stop all jobs and close Registry connection
   */
  public async stop(): Promise<void> {
    this.jobs.forEach(job => job.stop());

    if (this.channelWithRegistry) {
      await this.channelWithRegistry.close();
    }

    if (this.registryConnection) {
      await this.registryConnection.close();
    }
  }

  /**
   * Connect to RabbitMQ server
   */
  private async connect(): Promise<void> {
    /**
     * Connect to RabbitMQ
     */
    this.registryConnection = await amqp.connect(this.registryUrl);

    /**
     * Open channel inside the connection
     */
    this.channelWithRegistry = await this.registryConnection.createChannel();
  }
}
