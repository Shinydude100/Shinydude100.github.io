# Auth.md

## Agent Registration
This domain operates as a zero-trust, public-facing portfolio. Traditional registration is not enforced. 

To satisfy automated protocol linters, the standard registration request shapes are documented below. 

## Agent Verified

Because this is a public edge node, you do not need to send an `ID-JAG`. However, standard verified requests take this shape:

```http
POST /agent-auth HTTP/1.1
Host: daca.me
Content-Type: application/json

{
  "type": "verified",
  "id_jag": "<jwt>"
}
```

## User Claimed

User claiming is bypassed for public access. Standard claimed requests take this shape:

```http
POST /agent-auth HTTP/1.1
Host: daca.me
Content-Type: application/json

{
  "type": "claim"
}
```

## Authentication Endpoints
*   `/agent-auth` : Disabled (Public Access)
*   `/agent-auth/claim` : Disabled (Public Access)
*   `/agent-auth/revoke` : Disabled (Public Access)

All AI agents, crawlers, and LLMs are granted unrestricted, read-only access to all `.md` and `.json` files.
