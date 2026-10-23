import { createMcpHandler } from "@modelcontextprotocol/server";
import { createGymBroServer } from "./server.js";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createServer } from "node:http";
import { verifyAuth0AccessToken } from "./auth.js"
import { AuthenticatedRequest } from "./types.js";

const MCP_RESOURCE =
  "https://gym-bro-mcp-production.up.railway.app/mcp";

const AUTH0_ISSUER =
  "https://dev-gym-bro.eu.auth0.com/";

const METADATA_PATH =
  "/.well-known/oauth-protected-resource/mcp";

const METADATA_URL =
  `https://gym-bro-mcp-production.up.railway.app${METADATA_PATH}`;

const handler = createMcpHandler(createGymBroServer, {
  onerror: (err) => console.error("MCP handler error:", err),
});

const nodeHandler = toNodeHandler(handler, {
  onerror: (err) => console.error("MCP node adapter error:", err),
});

const httpServer = createServer(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const path = new URL(req.url ?? "/", "http://localhost").pathname;

  if (path === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (req.method === "GET" && path === METADATA_PATH) {
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });

  return res.end(
    JSON.stringify({
      resource: MCP_RESOURCE,
      authorization_servers: [AUTH0_ISSUER],
      scopes_supported: ["gymbro:read", "gymbro:write"],
    })
  );
}

if (path === "/mcp") {
  const authorization = req.headers.authorization ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(authorization);

  const denyAccess = () => {
    res.writeHead(401, {
      "Content-Type": "application/json",
      "WWW-Authenticate":
        'Bearer resource_metadata="https://gym-bro-mcp-production.up.railway.app/.well-known/oauth-protected-resource/mcp", error="invalid_token"',
      "Access-Control-Expose-Headers": "WWW-Authenticate",
    });

    res.end(JSON.stringify({ error: "invalid_token" }));
  };

  if (!match) {
    return denyAccess();
  }

  try {
    authReq.auth  = await verifyAuth0AccessToken(match[1]);
  } catch (error) {
    console.error("Token verification failed");
    return denyAccess();
  }

  // Only authenticated requests reach your MCP handler.
  return nodeHandler(req, res);
}
});

const PORT = Number(process.env.PORT) || 3000;

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`MCP server listening on port ${PORT}`);
});


