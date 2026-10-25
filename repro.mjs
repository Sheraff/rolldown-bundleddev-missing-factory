// node repro.mjs [--load-first]
// Starts Vite (experimental.bundledDev, devMode.lazy: false), opens the page,
// edits src/loader.js (the module holding `() => import('./lazy.js')`), then
// calls the hot-updated module's loader. lazy.js was never loaded on the page.
// With --load-first, lazy.js is loaded once before the edit (control).
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const loadFirst = process.argv.includes('--load-first')
const loaderFile = new URL('./src/loader.js', import.meta.url)
const original = readFileSync(loaderFile, 'utf8')

const server = await createServer({
  root: fileURLToPath(new URL('.', import.meta.url)),
  server: { port: 5199, strictPort: true },
  logLevel: 'warn',
})
await server.listen()
const out = (page) => page.textContent('#out')
let browser
try {
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH })
  const page = await browser.newPage()
  await page.goto('http://localhost:5199/')
  await page.waitForFunction(() => typeof window.__load === 'function')
  if (loadFirst) {
    await page.evaluate(() => window.__load())
    console.log('before edit:', await out(page))
  }
  await page.evaluate(() => (window.__initialLoad = window.__currentLoad))
  await new Promise((r) => setTimeout(r, 500))
  writeFileSync(loaderFile, original.replace('version = 1', 'version = 2'))
  await page.waitForFunction(() => window.__currentLoad !== window.__initialLoad, null, { timeout: 15000 })
  console.log('patched loader:', await page.evaluate(() => window.__currentLoad.toString()))
  await page.evaluate(() => window.__load())
  console.log('after edit:', await out(page))
} finally {
  writeFileSync(loaderFile, original)
  await browser?.close()
  await server.close()
}
