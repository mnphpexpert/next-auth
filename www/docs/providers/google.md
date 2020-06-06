---
id: google
title: Google
---

## API Documentation

https://developers.google.com/identity/protocols/oauth2s

## App Configuration

https://console.developers.google.com/apis/credentials

## Usage

```js
import Providers from `next-auth/providers`
...
providers: [
  Providers.Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientId: process.env.GOOGLE_CLIENT_SECRET,
  })
}
...
