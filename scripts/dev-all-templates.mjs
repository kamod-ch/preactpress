#!/usr/bin/env node
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const cli = path.join(root, 'bin/preactpress.mjs')

const templates = [
  { name: 'default', port: 5173 },
  { name: 'docs', port: 5174 },
  { name: 'magazine', port: 5175 },
  { name: 'hono', port: 5176 }
]

const children = []

function shutdown(signal) {
  for (const child of children) {
    if (!child.killed) child.kill(signal)
  }
}

process.on('SIGINT', () => {
  shutdown('SIGINT')
})
process.on('SIGTERM', () => {
  shutdown('SIGTERM')
})

for (const { name, port } of templates) {
  const child = spawn(
    process.execPath,
    [cli, 'dev', `templates/${name}`, '--port', String(port)],
    {
      cwd: root,
      stdio: 'inherit',
      env: process.env
    }
  )

  children.push(child)

  child.on('exit', (code, signal) => {
    if (signal) return
    if (code !== 0 && code !== null) {
      process.exitCode = code
      shutdown('SIGTERM')
    }
  })
}

console.log('Starting all templates (Ctrl+C to stop):')
for (const { name, port } of templates) {
  console.log(`  ${name.padEnd(10)} http://localhost:${port}`)
}
