import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export function resolvePackageDir(id) {
    return path.dirname(require.resolve(`${id}/package.json`));
}
export function resolveDependency(id) {
    return require.resolve(id);
}
//# sourceMappingURL=resolveDeps.js.map