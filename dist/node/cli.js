import path from 'node:path';
import process from 'node:process';
import minimist from 'minimist';
import c from 'picocolors';
import { createLogger } from 'vite';
import { createServer } from './server.js';
import { build } from './build.js';
import { preview } from './serve.js';
import { init } from './init.js';
const argv = minimist(process.argv.slice(2));
const first = argv._[0];
const wantsHelp = Boolean(argv.help || argv.h) ||
    first === 'help' ||
    first === '--help' ||
    first === '-h';
const logger = createLogger();
function printUsage() {
    logger.info([
        '',
        c.bold('preactpress') + ' <command> [root]',
        '',
        c.dim('Commands:'),
        '  dev       Start Vite dev server',
        '  build     Production build (SSR + static)',
        '  preview   Serve the production build',
        '  init      Scaffold .preactpress + starter files in [root] or cwd',
        '',
        c.dim('In this repo (package root, no site):'),
        '  pnpm run demo   Dev server for the bundled ./template site',
        '',
        c.dim('Options:'),
        '  --port <n>   Port for dev / preview',
        '  -h, --help   Show this help',
        ''
    ].join('\n'));
}
function logError(message, err) {
    const parts = [c.red(message)];
    if (err && typeof err === 'object' && 'message' in err) {
        parts.push(String(err.message));
    }
    if (err && typeof err === 'object' && 'stack' in err && process.env.DEBUG) {
        parts.push(String(err.stack));
    }
    logger.error(parts.filter(Boolean).join('\n'));
}
async function main() {
    if (wantsHelp) {
        printUsage();
        return;
    }
    const cmd = first ?? 'dev';
    const root = argv._[1] ? String(argv._[1]) : undefined;
    if (cmd === 'init') {
        const dir = root ? path.resolve(root) : process.cwd();
        await init(dir);
        logger.info(c.green(`Scaffolded PreactPress site in ${dir}`));
        return;
    }
    if (cmd === 'build') {
        await build(root);
        logger.info(c.green('Build finished.'));
        return;
    }
    if (cmd === 'preview' || cmd === 'serve') {
        await preview(root, { port: argv.port ? Number(argv.port) : undefined });
        return;
    }
    if (cmd === 'dev') {
        const server = await createServer(root, {
            port: argv.port ? Number(argv.port) : undefined
        });
        await server.listen();
        server.printUrls();
        return;
    }
    logError(`Unknown command "${cmd}". Try dev, build, preview, or init.`);
    process.exitCode = 1;
}
main().catch((err) => {
    logError('preactpress failed.', err);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map