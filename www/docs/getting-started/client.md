---
id: client
title: Client API
---

The NextAuth.js client library makes it easy to interact with sessions from React applications.

## useSession()

* Client Side: **Yes**
* Server Side: No

The `useSession()` React Hook in the NextAuth.js client is the easiest way to check if someone is signed in.

It works best when used with NextAuth.js `<Provider>` is added to `pages/_app.js` (see [provider](#provider)).

```jsx
import { useSession } from 'next-auth/client'

export default () => {
  const [ session, loading ] = useSession()

  return <>
    {session && <p>Signed in as {session.user.email}</p>}
    {!session && <p><a href="/api/auth/signin">Sign in</a></p>}
  </>
}
```

---

## getSession()

* Client Side: **Yes**
* Server Side: **Yes**

NextAuth.js provides a `getSession()` method which can be called client or server side to return a session.

It calls `/api/auth/session` and returns a promise with a session object, or null if no session exists.

A session object looks like this:

```js
{
  user: {
    name: string,
    email: string,
    image: uri
  },
  accessToken: string,
  expires: "YYYY-MM-DDTHH:mm:ss.SSSZ"
}
```

You can call `getSession()` inside a function to check if a user is signed in, or use it for server side rendered pages that supporting signing in without requiring client side JavaScript.

:::note
The session data returned to the client it does not contain sensitive information such as the Session Token or OAuth tokens. It only includes enough data needed to display information on a page about the user who is signed in (e.g name, email) .

You can use the [session callback](/configuration/callbacks#session) to customize the session object returned to the client if you need to add additional data to it.
:::

Because it is a Universal method, you can use `getSession()` in both client and server side functions.

```jsx title="pages/index.js"
import { getSession } from 'next-auth/client'

const Page = ({ session }) => (<p>
    {!session && <>
      Not signed in <br/>
      <a href="/api/auth/signin">Sign in</a>
    </>}
    {session && <>
      Signed in as {session.user.email} <br/>
      <a href="/api/auth/signout">Sign out</a>
    </>}
  </p>)

Page.getInitialProps = async (context) => {
  return {
    session: await getSession(context)
  }
}

export default Page
```

:::note
When calling `getSession()` server side, you must pass the request object or you can the pass entire `context` object as it contains the `req` object. e.g. `getSession(context)` or `getSession({req})`
:::

---

## getProviders()

* Client Side: **Yes**
* Server Side: **Yes**

The `getProviders()` method returns the list of providers currently configured for sign in.

It calls `/api/auth/providers` and returns a with a list of the currently configured authentication providers.

It can be use useful if you are creating a dynamic custom sign in page.

---

## getCsrfToken()

* Client Side: **Yes**
* Server Side: No

The `getCsrfToken()` method returns the current Cross Site Request Forgery (CSRF Token) required to make POST requests (e.g. for signing in and signing out). It calls `/api/auth/csrf`.

You likely only need to use this if you are not using the built-in `signIn()` and `signOut()` methods.

---

## signIn()

* Client Side: **Yes**
* Server Side: No

Using the `signIn()` method ensures the user ends back on the page they started on after completing a sign in flow. It will also handle CSRF tokens for you automatically when signing in with email.

The `signIn()` method can be called from the client in different ways, as shown below.

#### Redirects to sign in page when clicked

```js
import { signIn } from 'next-auth/client'

export default () => (
  <button onClick={signIn}>Sign in</button>
)
```

#### Starts Google OAuth sign-in flow when clicked

```js
import { signIn } from 'next-auth/client'

export default () => (
  <button onClick={() => signIn('google')}>Sign in with Google</button>
)
```

#### Starts Email sign-in flow when clicked

When using it with the email flow, pass the target `email` as an option.

```js
import { signIn } from 'next-auth/client'

export default ({ email }) => (
  <button onClick={() => signIn('email', { email })}>Sign in with Email</button>
)
```

#### Specifying a callbackUrl

By default, the URL of page the client is on when they sign in is used as the `callbackUrl` and that is the URL the client will be redirected to after signing in.

You can specify a different URL as the `callbackUrl` parameter by passing it in the second argument to `signIn()`. This works for all calls to `signIn()`.

e.g.

* `signIn(null, { callbackUrl: 'http://localhost:3000/foo' })`
* `signIn('google', { callbackUrl: 'http://localhost:3000/foo' })`
* `signIn('email', { email, callbackUrl: 'http://localhost:3000/foo' })`

The URL must be considered valid by the [redirect callback handler](/configuration/callbacks#redirect). By default this means it must be an absolute URL at the same hostname (or else it will default to the homepage); you can define your own custom redirect callback to allow other URLs, including supporting relative URLs.

---

## signOut()

* Client Side: **Yes**
* Server Side: No

Using the `signOut()` method ensures the user ends back on the page they started on after completing the sign out flow. It also handles CSRF tokens for you automatically.

It reloads the page in the browser when complete.

```js
import { signOut } from 'next-auth/client'

export default () => (
  <button onClick={signOut}>Sign out</button>
)
```

#### Specifying a callbackUrl

As with the `signIn()` function, you can specify a `callbackUrl` parameter by passing it as an option.

e.g. `signOut({ callbackUrl: 'http://localhost:3000/foo' })`

The URL must be considered valid by the [redirect callback handler](/configuration/callbacks#redirect). By default this means it must be an absolute URL at the same hostname (or else it will default to the homepage); you can define your own custom redirect callback to allow other URLs, including supporting relative URLs.

---

## Provider

Using the supplied React `<Provider>` allows instances of `useSession()` to share the session object across components, by using [React Context](https://reactjs.org/docs/context.html) under the hood.

This improves performance, reduces network calls and avoids page flicker when rendering. It is highly recommended and can be easily added to all pages in Next.js apps by using `pages/_app.js`.

```jsx title="pages/_app.js"
import { Provider } from 'next-auth/client'

export default ({ Component, pageProps }) => {
  const { session } = pageProps
  return (
    <Provider session={session} >
      <Component {...pageProps} />
    </Provider>
  )
}
```

If you pass the `session` page prop to the `<Provider>` – as in the example above – you can avoid checking the session twice on pages that support both server and client side rendering.

### Options

You can pass options to the provider.

e.g.

```jsx title="pages/_app.js"
import { Provider } from 'next-auth/client'

export default ({ Component, pageProps }) => {
  const { session } = pageProps
  return (
    <Provider options={{ 
      clientMaxAge: 60 * 60 // Auto-update client state every hour
     }} session={session} >
      <Component {...pageProps} />
    </Provider>
  )
}
```

#### clientMaxAge

**clientMaxAge** defines how often (in seconds) the client should automatically refresh the session.

When `clientMaxAge` is set to `0` (the default) sessions are not re-checked automatically, only when a new window or tab is opened or when `getSession()` is called. If set to any other value, specifies how many seconds the client should poll the server to check the session is valid and to keep it alive.

It can be useful to use this option to prevent sessions from timing out if your application has a short session expiry time but when you want them to stay active as long as a window or tab is active. This option usually has cost implications as checking session status triggers a call to a server side route and/or a database.

:::tip
In NextAuth.js session state is automatically synchronized across all open windows and tabs in the same browser. If you have session expiry times of 30 days or more (the default) you probably don't need to use the `clientMaxAge` option, or can set it to a high value (e.g. every 24 hours).
:::

:::note
See [**the Next.js documentation**](https://nextjs.org/docs/advanced-features/custom-app) for more information on **_app.js** in Next.js applications.
:::
