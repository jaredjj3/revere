export class RevereError extends Error {}

export class MissingEnvError extends RevereError {
  constructor(envVarName: string) {
    super(`missing env, please add to .env file: ${envVarName}`);
  }
}
