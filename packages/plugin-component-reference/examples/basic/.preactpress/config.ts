import { defineConfig } from "@kamod-ch/preactpress/config";
import { componentReferencePlugin } from "@preactpress/plugin-component-reference";

export default defineConfig({
  site: {
    title: "Component Reference Example",
    description: "Preact component props documentation",
  },
  plugins: [
    componentReferencePlugin({
      tsconfig: "../fixtures/ui-kit/tsconfig.json",
      catalog: [
        { component: "Button", source: "../fixtures/ui-kit/src/Button.tsx", exportName: "Button" },
        { component: "Input", source: "../fixtures/ui-kit/src/Input.tsx", exportName: "Input" },
        { component: "Dialog", source: "../fixtures/ui-kit/src/Dialog.tsx", exportName: "Dialog" },
      ],
    }),
  ],
});
