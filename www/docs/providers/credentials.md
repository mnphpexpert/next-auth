---
id: credentials
title: Credentials
---

export const Image = ({ children, src, alt = '' }) => ( 
  <div
    style={{
      padding: '0.2rem',
      width: '100%',
      display: 'flex',
      justifyContent: 'center'
    }}>
    <img alt={alt} src={src} />
  </div>
 )

## Overview

The Credentials provider allows you to handle signing in with arbitrary credentials, such as a username and password, domain, or two factor authentication or hardware device (e.g. YubiKey U2F / FIDO).

It is intended to support use cases where you have an existing system you need to authenticate users against.

It comes with the constraint that users authenticated in this manner are not persisted in the database, and that the Credentials provider can only be used if JSON Web Tokens are enabled for sessions.

:::note
The functionality provided for credentials based authentication is intentionally limited to discourage use of passwords due to the inherent security risks associated with them and the additional complexity associated with supporting usernames and passwords.
:::

## Example

The Credentials provider is specified like other providers, except that you need to define a handler for `authorize()` that accepts credentials input and returns either a `user` object or `false`.

If you return an object it will be persisted to the JSON Web Token and the user will be signed in.

If you return `false` or `null` then an error will be displayed advising the user to check their details.

```js title="pages/api/auth/[...nextauth].js"
import Providers from `next-auth/providers`
...
providers: [
  Providers.Credentials({
    // The name to display on the sign in form (e.g. 'Sign in with...')
    name: 'Credentials',
    // The credentials is used to generate a suitable form on the sign in page.
    // You can specify whatever fields you are expecting to be submitted.
    // e.g. domain, username, password, 2FA token, etc.
    credentials: {
      username: { label: "Username", type: "text", placeholder: "jsmith" },
      password: {  label: "Password", type: "password" }
    },
    authorize: async (credentials) => {
      const user = (credentials) => {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        return null
      }
      if (user) {
        // Any user object returned here will be saved in the JSON Web Token
        return Promise.resolve(user)
      } else {
        return Promise.resolve(null)
      }
    }
  })
]
...
```

To use your new credentials provider, you will need to create a form that posts back to `/api/auth/callback/credentials`.

All form parameters submitted will be passed as `credentials` to your `authorize` callback.

```js title="pages/signin"
import React from 'react'

export default () => {
  return (
    <form method='post' action='/api/auth/callback/credentials'>
      <input name='email' type='text' defaultValue='' />
      <input name='password' type='password' defaultValue='' />
      <button type='submit'>Sign in</button>
    </form>
  )
}
```

As the JSON Web Token is encrypted, you can safely store user credentials in it and revalidate them whenever an action is performed. See the [callbacks documentation](/configuration/callbacks) for more information on how to interact with the token.

## With multiple providers

### Usage

You can specify more than one credentials provider by specifying a unique `id` for each one.

You can also use them in conjuction with other provider options.

As with all providers, the order you specify them in, is the order they are displayed on the sign in page.

```js
  providers: [
    Providers.Credentials({
      id: 'domain-login',
      name: "Domain Account",
      authorize: async (credentials) => {
        const user = (credentials) => { /* add function to get user */ } 
        return Promise.resolve(user)
      },
      credentials: {
        domain: { label: "Domain", type: "text ", placeholder: "CORPNET", value: "CORPNET" },
        username: { label: "Username", type: "text ", placeholder: "jsmith" },
        password: {  label: "Password", type: "password" }
     }
    }),
    Providers.Credentials({
      id: 'intranet-credentials',
      name: "Two Factor Auth",
      authorize: async (credentials) => {
        const user = (credentials) => { /* add function to get user */ } 
        return Promise.resolve(user)
      },
      credentials: {
        email: { label: "Username", type: "text ", placeholder: "jsmith" },
        "2fa-key": {  label: "2FA Key" }
     },
    }),
    /* ... additional providers ... /*/
  ]
```

### Sign in

<Image src="/img/signin-complex.png"/>
