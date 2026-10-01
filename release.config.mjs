export default {
  packages: ["."],
  tagPackage: ".",
  qaCommand: "pnpm release:check",
  commitMessage: (version) => `chore: release v${version}`,
};
