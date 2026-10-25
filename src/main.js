import { load } from './loader.js'

// The loader the app currently uses; src/loader.js replaces it on hot update.
window.__currentLoad = load
window.__load = async () => {
  const out = document.getElementById('out')
  try {
    const mod = await window.__currentLoad()
    out.textContent = 'loaded: ' + mod.value
  } catch (err) {
    out.textContent = 'error: ' + err.constructor.name + ': ' + err.message
  }
}
