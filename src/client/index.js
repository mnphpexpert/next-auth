// fetch() is built in to Next.js 9.4 (you can use a polyfill if using an older version)
/* global fetch:false */
import { useState, useEffect, useContext, createContext, createElement } from 'react'

// Note: In calls to fetch() from universal methods, all cookies are passed
// through from the browser, when the server makes the HTTP request, so that
// it can authenticate as the browser.

// These can be overridden with NEXTAUTH_ env vars in next.config.js
// e.g. process.env.NEXTAUTH_SITE
const DEFAULT_BASE_URL_COOKIE_NAME = 'next-auth.base-url'
const DEFAULT_SITE = ''
const DEFAULT_BASE_PATH = '/api/auth'

// Universal method (client + server)
const getSession = async ({ req } = {}) => {
  const baseUrl = _baseUrl({ req })
  const options = req ? { headers: { cookie: req.headers.cookie } } : {}
  return _fetchData(`${baseUrl}/session`, options)
}

// Universal method (client + server)
const getProviders = async ({ req } = {}) => {
  const baseUrl = _baseUrl({ req })
  const options = req ? { headers: { cookie: req.headers.cookie } } : {}
  return _fetchData(`${baseUrl}/providers`, options)
}

// Universal method (client + server)
const getCsrfToken = async ({ req } = {}) => {
  const baseUrl = _baseUrl({ req })
  const options = req ? { headers: { cookie: req.headers.cookie } } : {}
  const data = await _fetchData(`${baseUrl}/csrf`, options)
  return data.csrfToken
}

// Hook to access the session data stored in the context
const useSession = (session) => {
  const value = useContext(SessionContext)
  // If we have no Provider in the tree we call the actual hook for fetching the session
  if (value === undefined) {
    return useSessionData(session)
  }

  return value
}

// Context to store session data globally
const SessionContext = createContext()

// Internal hook for getting session from the api.
const useSessionData = (session) => {
  const [data, setData] = useState(session)
  const [loading, setLoading] = useState(true)
  const _getSession = async () => {
    try {
      setData(await getSession())
      setLoading(false)
    } catch (error) {
      console.error('CLIENT_USE_SESSION_ERROR', error)
    }
  }
  useEffect(() => { _getSession() }, [])
  return [data, loading]
}

// @TODO Implement signin method
const signin = async (provider, args) => {
  if (!provider) {
    // @TODO Redirect to sign in page
    return
  }

  const providers = await getProviders()
  if (!providers[provider]) {
    // @TODO If Provider not recognized, redirect to sign in page
  } else if (providers[provider].type === 'oauth') {
    // @TODO If OAuth provider, redirect to providers[provider].signinUrl
  } else {
    // @TODO POST to providers[provider].signinUrl (with CSRF Token)
    const postArgs = {
      csrfToken: await getCsrfToken(),
      ...args
    }
    // @TODO Reload page if successful
  }
}

// @TODO Implement signout method
const signout = async () => {
  // @TODO POST to signout endpoint (with CSRF Token)
  const postArgs = {
    csrfToken: await getCsrfToken()
  }

  // @TODO Reload page if successful
}

// Provider to wrap the app in to make session data available globally
const Provider = ({ children, session }) => {
  const value = useSession(session)
  return createElement(SessionContext.Provider, { value }, children)
}

const _fetchData = async (url, options) => {
  try {
    const res = await fetch(url, options)
    const data = await res.json()
    return Object.keys(data).length > 0 ? data : null // Return null if data empty
  } catch (error) {
    console.error('CLIENT_FETCH_ERROR', url, error)
    return null
  }
}

const _baseUrl = ({ req }) => {
  if (req) {
    // Server Side
    // If we have a 'req' object are running sever side, so we should grab the
    // base URL from cookie that is set by the API route - which is how config
    // is shared automatically between the API route and the client.
    const cookies = req ? _parseCookies(req.headers.cookie) : null
    const baseUrlCookieName = process.env.NEXTAUTH_BASE_URL_COOKIE_NAME || DEFAULT_BASE_URL_COOKIE_NAME
    const cookieValue = cookies[`__Secure-${baseUrlCookieName}`] || cookies[baseUrlCookieName]
    const [baseUrl] = cookieValue ? cookieValue.split('|') : [null]
    return baseUrl
  } else {
    // Client Side
    // Note: 'site' is empty by default; URL is normally relative.
    const site = process.env.NEXTAUTH_SITE || DEFAULT_SITE
    const basePath = process.env.NEXTAUTH_BASE_PATH || DEFAULT_BASE_PATH
    return `${site}${basePath}`
  }
}

// Adapted from https://github.com/felixfong227/simple-cookie-parser/blob/master/index.js
const _parseCookies = (string) => {
  if (!string) { return {} }
  try {
    const object = {}
    const a = string.split(';')
    for (let i = 0; i < a.length; i++) {
      const b = a[i].split('=')
      if (b[0].length > 1 && b[1]) {
        object[b[0].trim()] = decodeURIComponent(b[1])
      }
    }
    return object
  } catch (error) {
    console.error('CLIENT_COOKIE_PARSE_ERROR', error)
    return {}
  }
}

export default {
  session: getSession,
  providers: getProviders,
  csrfToken: getCsrfToken,
  useSession,
  Provider
}
