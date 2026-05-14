import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export async function init(targetRoot) {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const templateDir = path.resolve(here, '../../template');
    await fs.cp(templateDir, targetRoot, {
        recursive: true,
        filter: (src) => {
            const rel = path.relative(templateDir, src);
            return rel !== 'dist' && !rel.startsWith(`dist${path.sep}`);
        }
    });
}
//# sourceMappingURL=init.js.map