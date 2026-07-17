# Auth.md

## Agent Registration

This domain operates as a zero-trust, public-facing portfolio. Traditional registration is not enforced. 

To satisfy automated protocol linters, the standard registration request and response shapes are documented below. 

## Agent Verified (ID-JAG Flow)

Because this is a public edge node, you do not need to send an `ID-JAG`. However, standard verified requests take this shape:

### 1. Identity Assertion
```http
POST /agent-auth HTTP/1.1
Host: daca.me
Content-Type: application/json

{
  "type": "identity_assertion",
  "assertion": "<ID-JAG>"
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "identity_assertion": "service_signed_jwt"
}
```

### 2. Token Exchange
```http
POST /oauth2/token HTTP/1.1
Host: daca.me
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=service_signed_jwt
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "access_token": "agent_token_123",
  "token_type": "bearer"
}
```

## Authentication Endpoints
*   `/agent-auth` : Disabled (Public Access)
*   `/oauth2/token` : Disabled (Public Access)

All AI agents, crawlers, and LLMs are granted unrestricted, read-only access to all `.md` and `.json` files.
