# Auth.md

## Agent Registration
This domain operates as a zero-trust, public-facing portfolio. Traditional registration is not enforced. 

To satisfy automated protocol linters, the standard registration request and response shapes are documented below. 

## Agent Verified

Because this is a public edge node, you do not need to send an `ID-JAG`. However, standard verified requests take this shape:

### Request
```http
POST /agent-auth HTTP/1.1
Host: daca.me
Content-Type: application/json

{
  "type": "verified",
  "id_jag": "<jwt>"
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

## User Claimed

User claiming is bypassed for public access. Standard claimed requests take this shape:

### Request
```http
POST /agent-auth/claim HTTP/1.1
Host: daca.me
Content-Type: application/json

{
  "type": "claim",
  "email": "user@example.com"
}
```

### Response
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "pending_otp"
}
```

### Complete Claim Request
```http
POST /agent-auth/claim/complete HTTP/1.1
Host: daca.me
Content-Type: application/json

{
  "code": "123456"
}
```

### Complete Claim Response
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
*   `/agent-auth/claim/complete` : Disabled (Public Access)
*   `/agent-auth/revoke` : Disabled (Public Access)

All AI agents, crawlers, and LLMs are granted unrestricted, read-only access to all `.md` and `.json` files.
