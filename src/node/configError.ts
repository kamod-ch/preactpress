/** Thrown when user configuration is invalid or incomplete. */
export class ConfigError extends Error {
  readonly path?: string;

  constructor(message: string, path?: string) {
    super(path ? `preactpress config: ${path}: ${message}` : `preactpress config: ${message}`);
    this.name = "ConfigError";
    this.path = path;
  }
}

export function assertConfig(condition: unknown, message: string, path?: string): asserts condition {
  if (!condition) throw new ConfigError(message, path);
}
