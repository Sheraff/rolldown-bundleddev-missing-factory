export const version = 1
export const load = () => import('./lazy.js')
if (import.meta.hot) {
  import.meta.hot.accept((next) => {
    // Like a router's HMR handler: adopt the new module's loader.
    window.__currentLoad = next.load
  })
}
