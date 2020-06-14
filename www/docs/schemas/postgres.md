---
id: postgres
title: Postgres Schema
---

The schema generated for a Postgres database when using the built-in models.

## User

```json
{
  "id": {
    "name": "id",
    "type": "integer",
    "nullable": false,
    "default": "nextval('users_id_seq'::regclass)"
  },
  "name": {
    "name": "name",
    "type": "character varying",
    "nullable": false,
    "default": null
  },
  "email": {
    "name": "email",
    "type": "character varying",
    "nullable": false,
    "default": null
  },
  "email_verified": {
    "name": "email_verified",
    "type": "timestamp without time zone",
    "nullable": false,
    "default": null
  },
  "image": {
    "name": "image",
    "type": "character varying",
    "nullable": false,
    "default": null
  },
  "created": {
    "name": "created",
    "type": "timestamp without time zone",
    "nullable": false,
    "default": "now()"
  },
  "updated": {
    "name": "updated",
    "type": "timestamp without time zone",
    "nullable": false,
    "default": "now()"
  }
}
```

## Account

```json
{
  "id": {
    "name": "id",
    "type": "integer",
    "nullable": false,
    "default": "nextval('accounts_id_seq'::regclass)"
  },
  "compound_id": {
    "name": "compound_id",
    "type": "character varying",
    "nullable": false,
    "default": null
  },
  "user_id": {
    "name": "user_id",
    "type": "integer",
    "nullable": false,
    "default": null
  },
  "provider_type": {
    "name": "provider_type",
    "type": "character varying",
    "nullable": false,
    "default": null
  },
  "provider_id": {
    "name": "provider_id",
    "type": "character varying",
    "nullable": false,
    "default": null
  },
  "provider_account_id": {
    "name": "provider_account_id",
    "type": "character varying",
    "nullable": false,
    "default": null
  },
  "refresh_token": {
    "name": "refresh_token",
    "type": "text",
    "nullable": false,
    "default": null
  },
  "access_token": {
    "name": "access_token",
    "type": "text",
    "nullable": false,
    "default": null
  },
  "access_token_expires": {
    "name": "access_token_expires",
    "type": "timestamp without time zone",
    "nullable": false,
    "default": null
  },
  "created": {
    "name": "created",
    "type": "timestamp without time zone",
    "nullable": false,
    "default": "now()"
  },
  "updated": {
    "name": "updated",
    "type": "timestamp without time zone",
    "nullable": false,
    "default": "now()"
  }
}
```

## Session

```json
{
  "id": {
    "name": "id",
    "type": "integer",
    "nullable": false,
    "default": "nextval('sessions_id_seq'::regclass)"
  },
  "user_id": {
    "name": "user_id",
    "type": "integer",
    "nullable": false,
    "default": null
  },
  "expires": {
    "name": "expires",
    "type": "timestamp without time zone",
    "nullable": false,
    "default": null
  },
  "session_token": {
    "name": "session_token",
    "type": "character varying",
    "nullable": false,
    "default": null
  },
  "access_token": {
    "name": "access_token",
    "type": "character varying",
    "nullable": false,
    "default": null
  },
  "created": {
    "name": "created",
    "type": "timestamp without time zone",
    "nullable": false,
    "default": "now()"
  },
  "updated": {
    "name": "updated",
    "type": "timestamp without time zone",
    "nullable": false,
    "default": "now()"
  }
}
```

## Verification Request

```json
{
  "id": {
    "name": "id",
    "type": "integer",
    "nullable": false,
    "default": "nextval('verification_requests_id_seq'::regclass)"
  },
  "identifer": {
    "name": "identifer",
    "type": "character varying",
    "nullable": false,
    "default": null
  },
  "token": {
    "name": "token",
    "type": "character varying",
    "nullable": false,
    "default": null
  },
  "expires": {
    "name": "expires",
    "type": "timestamp without time zone",
    "nullable": false,
    "default": null
  },
  "created": {
    "name": "created",
    "type": "timestamp without time zone",
    "nullable": false,
    "default": "now()"
  },
  "updated": {
    "name": "updated",
    "type": "timestamp without time zone",
    "nullable": false,
    "default": "now()"
  }
}
```
