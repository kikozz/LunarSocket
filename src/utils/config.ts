import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import logger from './logger';

const configPath = join(process.cwd(), 'config.json');

export function initConfig(): Config {
  if (!statSync(configPath, { throwIfNoEntry: false })) {
    writeFileSync(configPath, JSON.stringify(defaultConfig));

    logger.log('Default config file created at', configPath);
    logger.log(
      'You can now edit the config to your liking. Once edited, run LunarSocket again.'
    );
    process.exit(0);
  }

  return getConfigSync();
}

export default async function getConfig(): Promise<Config> {
  return JSON.parse(await readFile(configPath, 'utf-8'));
}

export function getConfigSync(): Config {
  return JSON.parse(readFileSync(configPath, 'utf-8'));
}

export async function editConfig(newConfig: Config): Promise<void> {
  await writeFile(configPath, JSON.stringify(newConfig, null, 2));
}

const defaultConfig = {
  server: {
    port: 80,
    secure: false,
    certificates: {
      key: '',
      cert: '',
    },
  },
  whitelist: {
    enabled: false,
    list: [] as string[],
  },
  welcomeMessage: 'LunarSocket made by SolarTweaks with love <3',
  operators: [] as string[],
  database: {
    type: 'instanceStorage' as 'instanceStorage' | 'mongo',
    config: {
      mongo: 'mongodb://<password>@localhost:27017',
    },
  },
};

type Config = typeof defaultConfig;
