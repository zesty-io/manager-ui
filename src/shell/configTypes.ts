/** `production` is the superset of all env blocks, so keys absent from `local`/`development`/`stage` are still typed as present. */
type EnvConfigModule = typeof import("shell/app.config");
export type AuthoredConfig = EnvConfigModule["production"];

export interface BuildInfo {
  _meta: Record<string, unknown>;
  data: {
    version: string;
    environment: string;
    gitCommit: string;
    gitBranch: string;
    buildEngineer: string;
    gitState: string;
    buildTimeStamp: number;
  };
  message: string;
}

export type AuthoredConfigWithBuild = AuthoredConfig & { build: BuildInfo };

export type RuntimeConfig = AuthoredConfigWithBuild &
  ReturnType<typeof import("utility/getRuntimeEnv").default> & {
    URL_PREVIEW_FULL?: string;
  };
