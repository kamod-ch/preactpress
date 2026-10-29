import { execFileSync } from "node:child_process";

/**
 * @param {string} spec
 * @param {string} cwd
 * @param {(file: string, args: string[], opts: object) => Buffer | string} execFile
 */
function npmViewJson(spec, cwd, execFile) {
  const output = execFile("npm", ["view", spec, "--json"], {
    encoding: "utf8",
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const trimmed = String(output).trim();
  if (!trimmed) {
    return null;
  }
  return JSON.parse(trimmed);
}

function isNotFoundError(error) {
  const stderr = error?.stderr?.toString?.() ?? "";
  const stdout = error?.stdout?.toString?.() ?? "";
  const combined = `${stdout}\n${stderr}`;
  return combined.includes("E404") || combined.includes("404 No match found");
}

/**
 * @param {{ cwd?: string, execFile?: typeof execFileSync }} [options]
 */
export function createNpmRegistryClient(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const execFile = options.execFile ?? execFileSync;

  return {
    /**
     * @param {string} name
     * @param {string} version
     */
    existsOnRegistry(name, version) {
      try {
        const metadata = npmViewJson(`${name}@${version}`, cwd, execFile);
        if (!metadata || typeof metadata !== "object") {
          return Promise.resolve({ ok: true, exists: false });
        }
        return Promise.resolve({ ok: true, exists: metadata.version === version });
      } catch (error) {
        if (isNotFoundError(error)) {
          return Promise.resolve({ ok: true, exists: false });
        }
        return Promise.resolve({ ok: false, error: "registry lookup failed (auth/network)" });
      }
    },

    /**
     * @param {string} name
     * @param {string} version
     */
    getReleaseEvidence(name, version) {
      try {
        const metadata = npmViewJson(`${name}@${version}`, cwd, execFile);
        if (!metadata) {
          return Promise.resolve({
            ok: false,
            error: `version ${name}@${version} not found on registry`,
          });
        }

        const repository =
          typeof metadata.repository === "string"
            ? { url: metadata.repository }
            : (metadata.repository ?? {});

        const attestations = metadata.dist?.attestations;
        let provenanceUrl = null;
        if (attestations && typeof attestations === "object") {
          provenanceUrl = attestations.provenance?.url ?? attestations.url ?? null;
        }

        return Promise.resolve({
          ok: true,
          evidence: {
            gitHead: metadata.gitHead ?? null,
            repositoryUrl: repository.url ?? null,
            repositoryDirectory: repository.directory ?? null,
            provenanceUrl,
          },
        });
      } catch (error) {
        if (isNotFoundError(error)) {
          return Promise.resolve({
            ok: false,
            error: `version ${name}@${version} not found on registry`,
          });
        }
        return Promise.resolve({
          ok: false,
          error: "registry metadata lookup failed (auth/network)",
        });
      }
    },
  };
}
