// Handle callbacks from login services
import oAuthCallback from '../lib/oauth/callback'
import callbackHandler from '../lib/callback-handler'
import cookie from '../lib/cookie'

// @TODO Refactor oAuthCallback to return promise instead of using a callback and reduce duplicate code
export default async (req, res, options, done) => {
  const { provider: providerName, providers, adapter, site, secret, baseUrl, cookies, callbackUrl, newAccountLandingPageUrl } = options
  const provider = providers[providerName]
  const { type } = provider
  const { getEmailVerification, deleteEmailVerification } = await adapter.getAdapter(options)

  // Get session ID (if set)
  const sessionToken = req.cookies[cookies.sessionToken.name]

  if (type === 'oauth') {
    oAuthCallback(req, provider, async (error, response) => {
      // @TODO Check error
      if (error) {
        console.error('OAUTH_CALLBACK_ERROR', error)
        res.status(302).setHeader('Location', `${baseUrl}/error?error=oAuthCallback`)
        res.end()
        return done()
      }

      const { profile, account } = response

      try {
        const { session, isNewAccount } = await callbackHandler(sessionToken, profile, account, options)

        // Save Session ID in cookie (HTTP Only cookie)
        cookie.set(res, cookies.sessionToken.name, session.sessionToken, { expires: session.sessionExpires || null, ...cookies.sessionToken.options })

        // Handle first logins on new accounts
        // e.g. option to send users to a new account landing page on initial login
        // Note that the callback URL is preserved, so the journey can still be resumed
        if (isNewAccount && newAccountLandingPageUrl) {
          res.status(302).setHeader('Location', newAccountLandingPageUrl)
          res.end()
          return done()
        }
      } catch (error) {
        if (error.name === 'AccountNotLinkedError') {
          // If the emai lon the account is already linked, but nto with this oAuth account
          res.status(302).setHeader('Location', `${baseUrl}/error?error=oAuthAccountNotLinked`)
        } else if (error.name === 'CreateUserError') {
          res.status(302).setHeader('Location', `${baseUrl}/error?error=oAuthCreateAccount`)
        } else {
          console.error('OAUTH_CALLBACK_ERROR', error)
          res.status(302).setHeader('Location', `${baseUrl}/error?error=Callback`)
        }
        res.end()
        return done()
      }

      // Callback URL is already verified at this point, so safe to use if specified
      if (callbackUrl) {
        res.status(302).setHeader('Location', callbackUrl)
        res.end()
      } else {
        res.status(302).setHeader('Location', site)
        res.end()
      }
      return done()
    })
  } else if (type === 'email') {
    try {
      const token = req.query.token
      const email = req.query.email ? req.query.email.toLowerCase() : null

      // Verify email and token match email verification record in database
      const invite = await getEmailVerification(email, token, secret, provider)
      if (!invite) {
        res.status(302).setHeader('Location', `${baseUrl}/error?error=Verification`)
        res.end()
        return done()
      }

      // If token is valid, delete email verification record in database…
      await deleteEmailVerification(email, token, secret, provider)

      // …lastly, invoke callbackHandler to go through sign up flow.
      // (Will create new account if they don't have one, or sign them into
      // an existing account if they do have one.)
      const dummyProviderAccount = { id: provider.id, type: 'email' }
      const { session, isNewAccount } = await callbackHandler(sessionToken, { email }, dummyProviderAccount, options)

      // Save Session ID in cookie (HTTP Only cookie)
      cookie.set(res, cookies.sessionToken.name, session.sessionToken, { expires: session.sessionExpires || null, ...cookies.sessionToken.options })

      // Handle first logins on new accounts
      // e.g. option to send users to a new account landing page on initial login
      // Note that the callback URL is preserved, so the journey can still be resumed
      if (isNewAccount && newAccountLandingPageUrl) {
        res.status(302).setHeader('Location', newAccountLandingPageUrl)
        res.end()
        return done()
      }

      // Callback URL is already verified at this point, so safe to use if specified
      if (callbackUrl) {
        res.status(302).setHeader('Location', callbackUrl)
        res.end()
      } else {
        res.status(302).setHeader('Location', site)
        res.end()
      }
      return done()
    } catch (error) {
      if (error.name === 'CreateUserError') {
        res.status(302).setHeader('Location', `${baseUrl}/error?error=EmailCreateAccount`)
      } else {
        res.status(302).setHeader('Location', `${baseUrl}/error?error=Callback`)
        console.error('EMAIL_CALLBACK_ERROR', error)
      }
      res.end()
      return done()
    }
  } else {
    res.status(500).end(`Error: Callback for provider type ${type} not supported`)
    return done()
  }
}
