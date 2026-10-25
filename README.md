# Rolldown bundled dev: HMR patch `import()` of a never-loaded chunk throws `MissingFactoryError`

Vite `experimental.bundledDev` with `devMode.lazy: false`. `src/loader.js` holds `() => import('./lazy.js')` and
self-accepts. `repro.mjs` opens the page, edits `src/loader.js`, then calls the hot-updated module's loader.

```sh
npm install
npx playwright install chromium   # or set CHROME_PATH
npm run repro                     # lazy.js was never loaded before the edit
node repro.mjs --load-first       # control: lazy.js loaded once before the edit
```

Output with vite 8.3.5 / rolldown 1.2.15:

```
$ npm run repro
patched loader: () => (__rolldown_runtime__.initModule("src/lazy.js"), Promise.resolve().then(() => __rolldown_runtime__.loadExports("src/lazy.js")))
after edit: error: MissingFactoryError: No factory registered for module src/lazy.js

$ node repro.mjs --load-first
before edit: loaded: lazy
patched loader: () => (__rolldown_runtime__.initModule("src/lazy.js"), Promise.resolve().then(() => __rolldown_runtime__.loadExports("src/lazy.js")))
after edit: loaded: lazy
```

Expected: `after edit: loaded: lazy` in both cases.

Manual steps: `npx vite`, open the page, edit `src/loader.js`, run `__load()` in the console, read `#out`.
