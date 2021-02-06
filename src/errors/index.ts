export class RevereError extends Error {}

export class MissingEnvError extends RevereError {
  constructor(envVarName: string) {
    super(`missing env, add to .env file: ${envVarName}`);
  }
}

export class NotImplementedError extends RevereError {
  constructor() {
    super('not implemented');
  }
}
