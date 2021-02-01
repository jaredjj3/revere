import { MissingEnvError } from '../errors';

export enum Env {
  CHANNEL_ID = 'CHANNEL_ID',
  BOT_TOKEN = 'BOT_TOKEN',
}

export const env = (key: Env): string => {
  const val = process.env[key];
  if (!val) {
    throw new MissingEnvError(key);
  }
  return val;
};
