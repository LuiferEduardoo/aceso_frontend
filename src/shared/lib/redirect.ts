import { createElement } from 'react'
import { Navigate } from 'react-router'

/** Route component that redirects (relative to the current route) to `to`. */
export function redirectTo(to: string) {
  return function Redirect() {
    return createElement(Navigate, { to, replace: true })
  }
}
