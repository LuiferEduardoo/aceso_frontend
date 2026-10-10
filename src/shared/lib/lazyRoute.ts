import type { ComponentType } from 'react'

/** Builds a react-router `lazy` loader that code-splits a page module. */
export function lazyPage<M>(load: () => Promise<M>, pick: (module: M) => ComponentType) {
  return async () => ({ Component: pick(await load()) })
}
