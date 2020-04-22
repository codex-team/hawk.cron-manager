import fs from 'fs';
import * as yaml from 'yaml';
import path from 'path';
import { CronManagerConfig } from './src/types';
import CronManager from './src/manager';
import dotenv from 'dotenv';

dotenv.config();

const configFile = fs.readFileSync(path.join(__dirname, './config.yml')).toString();

const cronManagerConfig = yaml.parse(configFile) as CronManagerConfig;

if (!process.env.REGISTRY_URL) {
  console.error('You must provide REGISTRY_URL via .env file to run CronManager');
  process.exit();
} else {
  const manager = new CronManager(process.env.REGISTRY_URL, cronManagerConfig);

  manager
    .start()
    .then(() => console.log('Cron manager started successfully'))
    .catch((e: Error) => console.error('Error while starting cron manager', e));
}
