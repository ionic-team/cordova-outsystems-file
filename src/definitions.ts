
export interface IFilePlugin {
  /**
   *
   */
  ping(success: (output: string) => void, error: (error: PluginError) => void): void;
}

export type PluginError = {
  code: string,
  message: string
}