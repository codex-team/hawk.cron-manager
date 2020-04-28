import { Validator } from 'jsonschema';
import { isValidCron } from 'cron-validator';

/**
 * JSON schema for Cron Manager config
 */
const configSchema = {
  id: '/Config',
  type: 'object',
  properties: {
    registryUrl: { type: 'string' },
    exchangeName: { type: 'string' },
    tasks: {
      type: 'array',
      items: { $ref: '/Task' },
    },
  },
  required: ['registryUrl', 'tasks'],
  additionalProperties: false,
};

/**
 * JSON Schema for specific task
 */
const taskSchema = {
  id: '/Task',
  type: 'object',
  properties: {
    routingKey: { type: 'string' },
    schedule: {
      type: 'string',
      format: 'cron',
    },
    payload: { type: 'object, null' },
  },
  required: ['routingKey', 'schedule'],
  additionalProperties: false,

};

/**
 * Add support for validation cron strings
 *
 * @param input - string to check
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Validator.prototype.customFormats.cron = function (input: any): boolean {
  if (typeof input === 'string') {
    return isValidCron(input, {
      seconds: true,
      alias: true,
    });
  }

  return false;
};

export default configSchema;

export { taskSchema };
