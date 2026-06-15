import http from "node:http";
import process from "node:process";
import sirv from "sirv";
import { applySiteBaseOverride, resolveConfigForBuild } from "./config.js";

export async function preview(
  root?: string,
  opts: { port?: number; host?: string | boolean; base?: string } = {},
): Promise<void> {
  const site = await resolveConfigForBuild(root);
  if (opts.base) applySiteBaseOverride(site, opts.base);
  const serve = sirv(site.outDir, { etag: true, gzip: true, brotli: true });
  const basePath = site.site.base === "/" ? "" : site.site.base.replace(/\/$/, "");

  const server = http.createServer((req, res) => {
    const originalUrl = req.url ?? "/";
    let url = originalUrl;
    if (basePath && url.startsWith(basePath)) {
      url = url.slice(basePath.length) || "/";
    }
    (req as http.IncomingMessage & { url?: string }).url = url;
    serve(req, res, () => {
      (req as http.IncomingMessage & { url?: string }).url = originalUrl;
      res.statusCode = 404;
      res.end("Not Found");
    });
  });

  const port = Number(opts.port ?? 4173);
  const host = typeof opts.host === "string" ? opts.host : "0.0.0.0";

  await new Promise<void>((resolve, reject) => {
    server.on("error", reject);
    server.listen(port, host, () => {
      const printedHost = host === "0.0.0.0" ? "localhost" : host;
      site.logger.info(`\n  preactpress preview  http://${printedHost}:${port}${site.site.base}\n`);
    });
    const stop = (): void => {
      server.close(() => resolve());
    };
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  });
}
