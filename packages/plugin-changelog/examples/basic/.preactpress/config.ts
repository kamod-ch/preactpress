import { defineConfig } from "@kamod-ch/preactpress/config";
import { changelogPlugin } from "@preactpress/plugin-changelog";

export default defineConfig({
  site: {
    title: "Changelog Plugin Example",
    description: "Generated release pages from Keep a Changelog",
    url: "https://example.com",
  },
  build: {
    feed: true,
  },
  plugins: [
    changelogPlugin({
      provider: "local",
      local: "../../fixtures/CHANGELOG.md",
      route: "/changelog",
      changesets: { dir: "../../fixtures/changesets" },
    }),
  ],
});
