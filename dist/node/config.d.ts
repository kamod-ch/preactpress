import { type ConfigEnv } from 'vite';
import type { SiteConfig, UserConfig } from './siteConfig.js';
import { PACKAGE_ROOT } from './packageRoot.js';
export declare function resolveUserConfig(root: string, env: ConfigEnv): Promise<UserConfig>;
export declare function resolveConfig(rootArg?: string, command?: ConfigEnv['command'], mode?: string): Promise<SiteConfig>;
export declare function normalizeBase(base: string): string;
export declare function siteConfigToClientJson(config: SiteConfig): string;
/** For SSR: re-resolve config with production mode. */
export declare function resolveConfigForBuild(root?: string): Promise<SiteConfig>;
export { PACKAGE_ROOT };
//# sourceMappingURL=config.d.ts.map