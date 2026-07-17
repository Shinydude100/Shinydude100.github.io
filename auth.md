# Auth.md

## Agent Registration

This domain operates as a zero-trust, public-facing portfolio. Traditional registration is not enforced. 

To satisfy automated protocol linters, the standard standalone registration flow is documented below. 

## Standalone Registration Flow

Because this is a public edge node, agents can register anonymously using the `none` identity and credential types advertised in our authorization server metadata.

### Request
```http
POST /agent-auth HTTP/1.1
Host: daca.me
Content-Type: application/json

{
  "identity_type": "none",
  "credential_type": "none"
}
```

### Response
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
*   `/agent-auth/claim` : Disabled (Public Access)
*   `/agent-auth/revoke` : Disabled (Public Access)

All AI agents, crawlers, and LLMs are granted unrestricted, read-only access to all `.md` and `.json` files.
