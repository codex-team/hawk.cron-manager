import CronManager from '../src/manager';
import { CronManagerConfig } from '../src/types';
import amqp from 'amqplib';
import waitForExpect from 'wait-for-expect';
import { CronJob } from 'cron';

jest.mock('amqplib');

/**
 * CronManager config for testing
 */
const testConfig: CronManagerConfig = {
  registryUrl: 'ampq://fake',
  tasks: [
    {
      routingKey: 'testWorkerName',
      schedule: '* * * * * *',
    },
  ],
};

/**
 * Amqp channel mock
 */
const mockedAmqpChannel = {
  publish: jest.fn(),
  close: jest.fn(),
};

/**
 * Connection object mock for testing work with RabbitMQ
 */
const mockedAmqpConnection = {
  createChannel: (): object => mockedAmqpChannel,
  close: jest.fn(),
};

const mockedConnect = amqp.connect as jest.Mock;

mockedConnect.mockResolvedValue(Promise.resolve(mockedAmqpConnection));

/**
 * CronManager config (with error) for testing
 */
const wrongConfig = {
  registryUrl: 'ampq://fake',
  tasks: [
    {
      routingKey: 'testWorkerName',
      schedule: '* * * * * *',
      unnecessaryProp: true,
    },
  ],
};

/**
 * CronManager config for testing (with error in schedule format)
 */
const wrongConfigWithCronError: CronManagerConfig = {
  registryUrl: 'ampq://fake',
  tasks: [
    {
      routingKey: 'cron-tasks/archiver',
      schedule: '* * * * * 190',
    },
  ],
};

describe('CronManager', () => {
  let cronManager: CronManager;

  it('should initialized correctly', () => {
    cronManager = new CronManager(testConfig);
  });

  it('should start correctly', async () => {
    await cronManager.start();
    expect(mockedConnect).toHaveBeenCalledTimes(1);

    const jobs = cronManager['jobs'] as CronJob[];
    const isJobRunning = jobs[0].running;

    expect(isJobRunning).toEqual(true);
  });

  it('should correctly add tasks to the queue', async () => {
    await waitForExpect(() => {
      expect(mockedAmqpChannel.publish).toHaveBeenCalled();
    }, 2000);
  });

  it('should stop correctly', async () => {
    await cronManager.stop();
    expect(mockedAmqpConnection.close).toHaveBeenCalledTimes(1);
    expect(mockedAmqpChannel.close).toHaveBeenCalledTimes(1);
  });

  it('should not initialized if config is invalid (additional prop)', () => {
    expect(() => new CronManager(wrongConfig as CronManagerConfig))
      .toThrow('Config is invalid');
  });

  it('should not initialized if config is invalid (invalid schedule string)', () => {
    expect(() => new CronManager(wrongConfigWithCronError))
      .toThrow('Config is invalid');
  });
});
