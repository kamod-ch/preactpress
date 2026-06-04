import path from 'node:path'
import process from 'node:process'
import minimist from 'minimist'
import c from 'picocolors'
import { PACKAGE_ROOT } from './packageRoot.js'

const argv = minimist(process.argv.slice(2))
const first = argv._[0] as string | undefined
const wantsHelp =
  Boolean(argv.help || argv.h) ||
  first === 'help' ||
  first === '--help' ||
  first === '-h'

function isPackageRoot(cwd: string): boolean {
  const a = path.resolve(cwd)
  const b = path.resolve(PACKAGE_ROOT)
  if (a === b) return true
  try {
    return process.cwd() === cwd && path.resolve(process.cwd()) === b
  } catch {
    return false
  }
}

function printUsage(): void {
  console.log(
    [
      '',
      c.bold('preactpress') + ' <command> [root]',
      '',
      c.dim('Commands:'),
      '  dev       Start Vite dev server',
      '  build     Production build (SSR + static)',
      '  preview   Serve the production build',
      '  check     Validate config, routes, nav/sidebar, and local links',
      '  init      Scaffold .preactpress + starter files in [root] or cwd',
      '            Use --template docs or --template magazine for larger starters',
      '',
      c.dim('In this repo (package root, no site):'),
      '  pnpm run demo          Dev server for the bundled ./template site',
      '  pnpm run demo:preview  Build + preview ./template (production output)',
      '',
      c.dim('Options:'),
      '  --port <n>   Port for dev / preview',
      '  --host       Host for dev / preview',
      '  --open       Open browser for dev',
      '  --base <p>   Override configured site.base',
      '  --template <name>  Starter for init: default, docs, or magazine',
      '  -h, --help   Show this help',
      ''
    ].join('\n')
  )
}

function resolveRootArg(cmd: string, rootArg: string | undefined): string | undefined {
  if (rootArg || !isPackageRoot(process.cwd())) return rootArg
  if (cmd === 'dev' || cmd === 'build' || cmd === 'preview' || cmd === 'serve' || cmd === 'check') {
    const templateRoot = path.join(PACKAGE_ROOT, 'template')
    console.log(
      c.yellow(
        `No site root was passed from the PreactPress package root; using bundled template site at ${templateRoot}.`
      )
    )
    return templateRoot
  }
  return rootArg
}

function positionalRoot(): string | undefined {
  const candidate = argv._[1] ? String(argv._[1]) : undefined
  return candidate && !candidate.startsWith('-') ? candidate : undefined
}

function logError(message: string, err?: unknown): void {
  const parts = [c.red(message)]
  if (err && typeof err === 'object' && 'message' in err) {
    parts.push(String((err as { message: unknown }).message))
  }
  if (err && typeof err === 'object' && 'stack' in err && process.env.DEBUG) {
    parts.push(String((err as { stack: unknown }).stack))
  }
  console.error(parts.filter(Boolean).join('\n'))
}

async function main(): Promise<void> {
  if (wantsHelp) {
    printUsage()
    return
  }

  if (!first && isPackageRoot(process.cwd())) {
    printUsage()
    console.log(
      c.yellow(
        'No site command was run because this directory contains the PreactPress CLI sources. Use `pnpm run demo` for the bundled starter site.'
      )
    )
    return
  }

  const cmd = first ?? 'dev'
  const root = resolveRootArg(cmd, positionalRoot())

  if (cmd === 'init') {
    const dir = root ? path.resolve(root) : process.cwd()
    const { init } = await import('./init.js')
    const result = await init(dir, {
      template: argv.template ? String(argv.template) : undefined
    })
    const templateLabel = result.template === 'default' ? 'default template' : `${result.template} template`
    console.log(c.green(`Scaffolded PreactPress site in ${result.root} using the ${templateLabel}`))
    console.log('')
    console.log(c.dim('Next steps:'))
    const rel = path.relative(process.cwd(), result.root)
    if (rel && rel !== '.') {
      const cdTarget = rel.startsWith('..') ? result.root : rel
      console.log(`  cd ${cdTarget}`)
    }
    console.log('  pnpm install    # or npm install')
    console.log('  pnpm run dev      # http://localhost:5173')
    return
  }

  if (cmd === 'build') {
    const { build } = await import('./build.js')
    await build(root, { base: argv.base ? String(argv.base) : undefined })
    console.log(c.green('Build finished.'))
    return
  }

  if (cmd === 'preview' || cmd === 'serve') {
    const { preview } = await import('./serve.js')
    await preview(root, {
      port: argv.port ? Number(argv.port) : undefined,
      host: parseHostFlag(argv.host),
      base: argv.base ? String(argv.base) : undefined
    })
    return
  }

  if (cmd === 'check') {
    const { check, printCheckResult } = await import('./check.js')
    const result = await check(root)
    printCheckResult(result)
    if (result.issues.some((issue) => issue.level === 'error')) process.exitCode = 1
    return
  }

  if (cmd === 'dev') {
    const { createServer } = await import('./server.js')
    const server = await createServer(root, {
      port: argv.port ? Number(argv.port) : undefined,
      host: parseHostFlag(argv.host),
      open: Boolean(argv.open),
      base: argv.base ? String(argv.base) : undefined
    })
    await server.listen()
    server.printUrls()
    return
  }

  logError(`Unknown command "${cmd}". Try dev, build, preview, check, or init.`)
  process.exitCode = 1
}

function parseHostFlag(value: unknown): string | boolean | undefined {
  if (value === undefined) return undefined
  if (value === true) return true
  return String(value)
}

main().catch((err) => {
  logError('preactpress failed.', err)
  process.exit(1)
})
