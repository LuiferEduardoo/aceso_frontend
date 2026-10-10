const TOKEN_KEY = 'aceso.accessToken'

type Listener = () => void

function readStorage(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function writeStorage(token: string | null): void {
  try {
    if (token === null) window.localStorage.removeItem(TOKEN_KEY)
    else window.localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Storage can be unavailable (private mode, blocked site data); keep the in-memory value.
  }
}

let currentToken: string | null = readStorage()
const listeners = new Set<Listener>()

/** Observable access-token store, backed by localStorage when available. */
export const tokenStore = {
  get(): string | null {
    return currentToken
  },
  set(token: string | null): void {
    if (token === currentToken) return
    currentToken = token
    writeStorage(token)
    listeners.forEach((listener) => listener())
  },
  clear(): void {
    tokenStore.set(null)
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  /** Re-reads storage; used by tests to reset state. */
  reload(): void {
    currentToken = readStorage()
    listeners.forEach((listener) => listener())
  },
}
