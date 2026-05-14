import path from 'node:path';
export const PREACTPRESS_DIR = '.preactpress';
export function resolveConfigDir(root) {
    return path.resolve(root, PREACTPRESS_DIR);
}
export function resolveConfigPath(root) {
    return path.resolve(root, PREACTPRESS_DIR, 'config.ts');
}
export function slash(p) {
    return p.replace(/\\/g, '/');
}
//# sourceMappingURL=paths.js.map