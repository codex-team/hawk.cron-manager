const configSchema = {
  id: '/Config',
  properties: {
    tasks: {
      type: 'array',
      items: { $ref: '/Task' },
    },
  },
  required: [ 'tasks' ],
};

const taskSchema = {
  id: '/Task',
  properties: {
    workerType: { type: 'string' },
    schedule: { type: 'string' },
    payload: { type: 'object, null' },
  },
  required: ['workerType', 'schedule'],
};

export default configSchema;

export { taskSchema };
