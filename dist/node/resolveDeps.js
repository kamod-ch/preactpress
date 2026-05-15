import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export function resolvePackageDir(id) {
    return path.dirname(require.resolve(`${id}/package.json`));
}
export function resolveDependency(id) {
    return require.resolve(id);
}
/** ESM entry paths for Vite dev SSR (avoids CJS `require` in the module runner). */
export function resolvePreactEsm(id) {
    const root = resolvePackageDir('preact');
    const map = {
        preact: path.join(root, 'dist/preact.mjs'),
        'preact/jsx-runtime': path.join(root, 'jsx-runtime/dist/jsxRuntime.mjs'),
        'preact/jsx-dev-runtime': path.join(root, 'jsx-runtime/dist/jsxRuntime.mjs'),
        'preact/hooks': path.join(root, 'hooks/dist/hooks.mjs'),
        'preact/devtools': path.join(root, 'devtools/dist/devtools.mjs')
    };
    if (id === 'preact-render-to-string') {
        return path.join(resolvePackageDir('preact-render-to-string'), 'dist/index.mjs');
    }
    return map[id] ?? resolveDependency(id);
}
//# sourceMappingURL=resolveDeps.js.map