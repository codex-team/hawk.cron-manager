import fs from 'fs';
import * as yaml from 'yaml';
import path from 'path';
import { CronManagerConfig } from './src/types';
import CronManager from './src/manager';

const configFile = fs.readFileSync(path.join(__dirname, './config.yml')).toString();

const cronManagerConfig = yaml.parse(configFile) as CronManagerConfig;

const manager = new CronManager(cronManagerConfig);

manager
  .start()
  .then(() => console.log('Cron manager started successfully'))
  .catch((e: Error) => console.error('Error while starting cron manager', e));
