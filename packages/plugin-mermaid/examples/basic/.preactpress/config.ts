import { defineConfig } from "@kamod-ch/preactpress/config";
import { mermaidPlugin } from "@preactpress/plugin-mermaid";

export default defineConfig({
  site: {
    title: "Mermaid Plugin Example",
    description: "Reference site for @preactpress/plugin-mermaid",
  },
  plugins: [mermaidPlugin()],
});
