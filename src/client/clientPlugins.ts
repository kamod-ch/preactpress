import { clientPlugins } from "virtual:preactpress-client-plugins";

/** Runs all registered plugin client enhancements after content updates. */
export async function runClientPlugins(): Promise<void> {
  await Promise.all(
    clientPlugins.map(async (plugin) => {
      if (!plugin.enhance) return;
      try {
        await plugin.enhance();
      } catch (error) {
        console.warn(`PreactPress client plugin "${plugin.name}" failed`, error);
      }
    }),
  );
}
