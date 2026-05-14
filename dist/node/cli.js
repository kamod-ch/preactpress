import path from 'node:path';
import process from 'node:process';
import minimist from 'minimist';
import c from 'picocolors';
import { PACKAGE_ROOT } from './packageRoot.js';
const argv = minimist(process.argv.slice(2));
const first = argv._[0];
const wantsHelp = Boolean(argv.help || argv.h) ||
    first === 'help' ||
    first === '--help' ||
    first === '-h';
function isPackageRoot(cwd) {
    const a = path.resolve(cwd);
    const b = path.resolve(PACKAGE_ROOT);
    if (a === b)
        return true;
    try {
        return process.cwd() === cwd && path.resolve(process.cwd()) === b;
    }
    catch {
        return false;
    }
}
function printUsage() {
    console.log([
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
function resolveRootArg(cmd, rootArg) {
    if (rootArg || !isPackageRoot(process.cwd()))
        return rootArg;
    if (cmd === 'dev' || cmd === 'build' || cmd === 'preview' || cmd === 'serve') {
        const templateRoot = path.join(PACKAGE_ROOT, 'template');
        console.log(c.yellow(`No site root was passed from the PreactPress package root; using bundled template site at ${templateRoot}.`));
        return templateRoot;
    }
    return rootArg;
}
function positionalRoot() {
    const candidate = argv._[1] ? String(argv._[1]) : undefined;
    return candidate && !candidate.startsWith('-') ? candidate : undefined;
}
function logError(message, err) {
    const parts = [c.red(message)];
    if (err && typeof err === 'object' && 'message' in err) {
        parts.push(String(err.message));
    }
    if (err && typeof err === 'object' && 'stack' in err && process.env.DEBUG) {
        parts.push(String(err.stack));
    }
    console.error(parts.filter(Boolean).join('\n'));
}
async function main() {
    if (wantsHelp) {
        printUsage();
        return;
    }
    if (!first && isPackageRoot(process.cwd())) {
        printUsage();
        console.log(c.yellow('No site command was run because this directory contains the PreactPress CLI sources. Use `pnpm run demo` for the bundled starter site.'));
        return;
    }
    const cmd = first ?? 'dev';
    const root = resolveRootArg(cmd, positionalRoot());
    if (cmd === 'init') {
        const dir = root ? path.resolve(root) : process.cwd();
        const { init } = await import('./init.js');
        await init(dir);
        console.log(c.green(`Scaffolded PreactPress site in ${dir}`));
        return;
    }
    if (cmd === 'build') {
        const { build } = await import('./build.js');
        await build(root);
        console.log(c.green('Build finished.'));
        return;
    }
    if (cmd === 'preview' || cmd === 'serve') {
        const { preview } = await import('./serve.js');
        await preview(root, { port: argv.port ? Number(argv.port) : undefined });
        return;
    }
    if (cmd === 'dev') {
        const { createServer } = await import('./server.js');
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