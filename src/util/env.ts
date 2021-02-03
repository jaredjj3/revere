import { MissingEnvError } from '../errors';

export const env = (key: string): string => {
  const val = process.env[key];
  if (!val) {
    throw new MissingEnvError(key);
  }
  return val;
};
