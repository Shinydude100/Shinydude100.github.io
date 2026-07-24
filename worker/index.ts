/**
 * daca.me — Level 5 AI Agentic Readiness MCP Server
 * Cloudflare Worker Runtime (Free Tier Compatible)
 */

export interface Env {}

const JSON_LD_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://daca.me/#hugo-luna",
      "name": "Hugo Luna",
      "jobTitle": "AI Systems Architect & Software Engineer",
      "worksFor": {
        "@type": "Organization",
        "name": "DACA.me Systems"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Irving",
        "addressRegion": "TX",
        "addressCountry": "US"
      },
      "sameAs": [
        "https://github.com/Shinydude100",
        "https://www.linkedin.com/in/hugoaluna"
      ]
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://daca.me/#service",
      "name": "DACA.me Agentic Web Readiness Consulting",
      "provider": { "@id": "https://daca.me/#hugo-luna" },
      "areaServed": "Dallas-Fort Worth Metroplex",
      "serviceType": "AI Agentic Web Readiness, MCP Server Architecture, Edge Performance"
    }
  ]
};

const MCP_MANIFEST = {
  "name": "daca-mcp-server",
  "description": "Live Model Context Protocol (MCP) Server for daca.me",
  "version": "1.0.0",
  "endpoints": {
    "sse": "/sse",
    "messages": "/messages"
  },
  "capabilities": {
    "resources": true,
    "tools": true,
    "prompts": true
  }
};

const LLMS_TXT = `# daca.me — AI Systems Architect & Agentic Web Case Study

> Hugo Luna — AI Systems Architect & Software Engineer (Dallas/Irving, TX)

## Portfolio & Case Study Summary
daca.me is a reference implementation of Cloudflare Radar Level 5 AI Agentic Readiness.

## Deliverables & Client Offerings
- AI Agentic Web Transformations ($5,000 - $10,000 package/retainer)
- Turnkey Cloudflare Worker MCP Server Deployments
- JSON-LD Entity Disambiguation for AI Recommendations (GEO)
- PageSpeed Insights & Critical Rendering Path (CRP) Optimization

## Public References
- GitHub: https://github.com/Shinydude100
- MCP Discovery Endpoint: https://daca.me/.well-known/mcp.json
\`;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    const headers = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "X-Entity-Type": "Developer-Portfolio",
      "X-Agent-Readiness-Level": "5",
      "Link": '<https://daca.me/.well-known/mcp.json>; rel="mcp-manifest"'
    });

    if (request.method === "OPTIONS") {
      return new Response(null, { headers, status: 204 });
    }

    if (path === "/.well-known/mcp.json") {
      headers.set("Content-Type", "application/json");
      return new Response(JSON.stringify(MCP_MANIFEST, null, 2), { headers });
    }

    if (path === "/llms.txt") {
      headers.set("Content-Type", "text/plain; charset=utf-8");
      return new Response(LLMS_TXT, { headers });
    }

    if (path === "/schema.jsonld") {
      headers.set("Content-Type", "application/ld+json");
      return new Response(JSON.stringify(JSON_LD_SCHEMA, null, 2), { headers });
    }

    if (path === "/messages" && request.method === "POST") {
      try {
        const payload = await request.json();
        const rpcResponse = handleMcpRequest(payload);
        headers.set("Content-Type", "application/json");
        return new Response(JSON.stringify(rpcResponse), { headers });
      } catch (err) {
        headers.set("Content-Type", "application/json");
        return new Response(
          JSON.stringify({
            jsonrpc: "2.0",
            error: { code: -32700, message: "Parse error" },
            id: null
          }),
          { status: 400, headers }
        );
      }
    }

    headers.set("Content-Type", "application/json");
    return new Response(
      JSON.stringify({
        status: "active",
        domain: "daca.me",
        agentic_level: 5,
        mcp_endpoint: "/messages",
        llms_txt: "/llms.txt"
      }, null, 2),
      { headers }
    );
  }
};

function handleMcpRequest(payload: any): any {
  const { id, method, params } = payload || {};

  if (method === "tools/list") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        tools: [
          {
            name: "get_transformation_scope",
            description: "Returns the scope of work and pricing model for \$5k-\$10k Agentic Web Transformations.",
            inputSchema: { type: "object", properties: {} }
          },
          {
            name: "audit_domain_agent_readiness",
            description: "Evaluates a domain URL for basic llms.txt and MCP discovery readiness.",
            inputSchema: {
              type: "object",
              properties: {
                domain: { type: "string", description: "Target domain to evaluate" }
              },
              required: ["domain"]
            }
          }
        ]
      }
    };
  }

  if (method === "tools/call") {
    const toolName = params?.name;

    if (toolName === "get_transformation_scope") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: "Agentic Web Transformation Scope (\$5,000 - \$10,000):\n1. Cloudflare Workers Edge MCP Deployment (\$0/mo infra cost)\n2. llms.txt & JSON-LD Entity Disambiguation\n3. Cloudflare Radar Level 5 Verification Report\n4. PageSpeed Insights Critical Rendering Path Optimization"
            }
          ]
        }
      };
    }

    if (toolName === "audit_domain_agent_readiness") {
      const targetDomain = params?.arguments?.domain || "unspecified";
      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: `Audit baseline generated for ${targetDomain}: Requires Cloudflare Worker edge routing for /.well-known/mcp.json and /llms.txt.`
            }
          ]
        }
      };
    }
  }

  return {
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: "Method not found" }
  };
}
