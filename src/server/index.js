import { createHash, randomBytes } from 'crypto'
import cookie from './lib/cookie'
import parseProviders from './lib/providers'
import providers from './routes/providers'
import signin from './routes/signin'
import callback from './routes/callback'
import session from './routes/session'
import pages from './pages'

const DEFAULT_SITE = ''
const DEFAULT_PATH_PREFIX = '/api/auth'

export default (req, res, _options) => {
  return new Promise(async resolve => {
    const { url, query } = req
    const {
      slug,
      action = slug[0],
      provider = slug[1],
    } = query

    // Allow site name, path prefix to be overriden
    const site = _options.site || DEFAULT_SITE
    const pathPrefix = _options.pathPrefix || DEFAULT_PATH_PREFIX
    const urlPrefix = `${site}${pathPrefix}`

    // If no callback URL is provided, use site name
    const callbackUrl = query.callbackUrl || site
    
    // Use secure cookies if the site uses HTTPS
    // This being conditional allows cookies to work non-HTTPS development URLs
    // Honour secure cookie option, which sets 'secure' and also adds '__SECURE-'
    // prefix, but enable them by default if the site URL is HTTPS; but not for
    // non-HTTPS URLs like http://localhost which are used in development).
    // For more on prefixes see https://googlechrome.github.io/samples/cookie-prefixes/
    const secureCookies = _options.secureCookies || urlPrefix.startsWith('https://')
    const cookiePrefix = secureCookies ? '__SECURE-' : ''

    // @TODO Review cookie settings (names, options)
    const cookies = {
      // default cookie options
      sessionId: {
        name: `${cookiePrefix}next-auth.session-id`,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: secureCookies
        }
      },
      callbackUrl: {
        name: `${cookiePrefix}next-auth.callback-url`,
        options: {
          sameSite: 'lax',
          path: '/',
          secure: secureCookies
        }
      },
      urlPrefix: {
        name: `${cookiePrefix}next-auth.url-prefix`,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: secureCookies
        }
      },
      csrfToken: {
        // Default to __HOST- for CSRF token for additional protection if using secureCookies
        // NB: The `__HOST-` prefix is stricted than the `__SECURE-` prefix.
        name: `${ secureCookies ? '__Host-' : '' }next-auth.csrf-token`,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: secureCookies
        }
      },
      // Allow user cookie options to override any cookie settings above
      ..._options.cookies
    }
    
    // Secret used salt cookies and tokens (e.g. for CSRF protection).
    // If no secret option is specified then it creates one on the fly
    // based on options passed here. A options contains unique data, such as
    // oAuth provider secrets and database credentials it should be sufficent.
    const secret = _options.secret || createHash('sha256').update(JSON.stringify(_options)).digest('hex')

    // Ensure CSRF Token cookie is set for any subsequent requests.
    // Used as part of the strateigy for mitigation for CSRF tokens.
    //
    // Creates a cookie like 'next-auth.csrf-token' with the value 'token|hash',
    // where 'token' is the CSRF token and 'hash' is a hash made of the token and
    // the secret, and the two values are joined by a pipe '|'. By storing the
    // value and the hash of the value (with the secret used as a salt) we can
    // verify the cookie was set by the server and not by a malicous attacker.
    //
    // For more details, see the following OWASP links:
    // https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie
    // https://owasp.org/www-chapter-london/assets/slides/David_Johansson-Double_Defeat_of_Double-Submit_Cookie.pdf
    let csrfToken
    if (req.cookies[cookies.csrfToken.name]) {
      const [ csrfTokenValue, csrfTokenHash ] = req.cookies[cookies.csrfToken.name].split('|')
      if (csrfTokenHash == createHash('sha256').update(`${csrfTokenValue}${secret}`).digest('hex')) {
        // If hash matches then we trust the CSRF token value
        csrfToken = csrfTokenValue
      } else {
        // @TODO Add handler to reject POST requests for auth routes if the token doesn't match.
        // Only triggered when there is a cookie but the hash doesn't match. Should be handled gracefully.
        console.warn('CSRF_TOKEN_CHECK_WARNING')
      }
    }
    if (!csrfToken) {
      // If no csrfToken - because it's not been set yet, or because the hash doesn't match
      // (e.g. because it's been modifed or because the secret has changed) create a new token.
      csrfToken = randomBytes(32).toString('hex')
      const newCsrfTokenCookie = `${csrfToken}|${createHash('sha256').update(`${csrfToken}${secret}`).digest('hex')}`
      cookie.set(res, cookies.csrfToken.name, newCsrfTokenCookie, cookies.csrfToken.options)
    }

    // User provided options are overriden by other options,
    // except for the options with special handlign above
    const options = {
      ..._options,
      site,
      pathPrefix,
      urlPrefix,
      callbackUrl,
      action,
      provider,
      cookies,
      secret,
      csrfToken,
      providers: parseProviders(_options.providers, urlPrefix),
    }
    
    if (req.method === 'GET') {
      switch (action) {
        case 'providers':
          providers(req, res, options, resolve)
          break
        case 'session':
          session(req, res, options, resolve)
          break
        case 'signin':
          if (provider && options.providers[provider]) {
            signin(req, res, options, resolve)
          } else {
            pages.render(res, 'signin', {
              providers: Object.values(options.providers),
              callbackUrl: options.callbackUrl
            })
          }
          break
        case 'callback':
          if (provider && options.providers[provider]) {
            callback(req, res, options, resolve)
          } else {
            res.statusCode = 400
            res.end(`Error: HTTP GET is not supported for ${url}`)
            return resolve()
          }
          break
        case 'unlink':
          break
        case 'signout':
          break
        case 'done':
          res.end(`If you can see this, it worked!`)
          return resolve()
        default:
          res.statusCode = 400
          res.end(`Error: HTTP GET is not supported for ${url}`)
          return resolve()
      }
    } else if (req.method === 'POST') {
      switch (route) {
        default:
          res.statusCode = 400
          res.end(`Error: HTTP POST is not supported for ${url}`)
          return resolve()
      }
    } else {
      res.statusCode = 400
      res.end(`Error: HTTP ${req.method} is not supported for ${url}`)
      return resolve()
    }
  })
}