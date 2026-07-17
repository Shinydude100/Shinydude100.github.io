# Auth.md

## Agent Registration
This domain operates as a zero-trust, public-facing portfolio. Traditional **Agent Registration** is not required. 

## Supported Flows
As a public edge node, we explicitly bypass the standard Auth.md registration flows to grant unrestricted read-access:
*   **Agent Verified**: Not required. No JWKS validation or `ID-JAG` assertion is needed to read these documents.
*   **User Claimed**: Not required. We do not enforce `OTP` verification or backchannel revocation.

## Authentication Endpoints
*   `/agent-auth` : Disabled (Public Access)
*   `/agent-auth/claim` : Disabled (Public Access)
*   `/agent-auth/claim/complete` : Disabled (Public Access)

All AI agents, crawlers, and LLMs are granted unrestricted, read-only `OAuth` equivalent access to all `.md` and `.json` files.
