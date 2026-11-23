/** Thin wrapper over full-page navigation so it can be stubbed in tests (jsdom's `location` is not mockable). */
export const browser = {
  assign: (url: string): void => window.location.assign(url),
}
