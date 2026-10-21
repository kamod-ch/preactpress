import { mkdir, readlink, rm, symlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Link the monorepo package into a scaffolded site (same as a local file: install). */
export async function linkLocalPackage(siteRoot) {
  const linkPath = path.join(siteRoot, "node_modules", "@kamod-ch", "preactpress");
  await mkdir(path.dirname(linkPath), { recursive: true });
  try {
    const existing = await readlink(linkPath);
    if (path.resolve(path.dirname(linkPath), existing) === packageRoot) return;
    await rm(linkPath, { recursive: true, force: true });
  } catch (err) {
    const code = err?.code;
    if (code !== "ENOENT" && code !== "EINVAL" && code !== "ELOOP") throw err;
    try {
      await rm(linkPath, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
  await symlink(packageRoot, linkPath, "dir");
}

const siteArg = process.argv[2];
if (siteArg) {
  const siteRoot = path.resolve(process.cwd(), siteArg);
  await linkLocalPackage(siteRoot);
  console.log(`Linked @kamod-ch/preactpress → ${packageRoot} in ${siteRoot}`);
}
