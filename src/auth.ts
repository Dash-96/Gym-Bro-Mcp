import { createRemoteJWKSet, jwtVerify } from "jose";

const AUTH0_ISSUER = "https://dev-gym-bro.eu.auth0.com/";

const MCP_RESOURCE = "https://gym-bro-mcp-production.up.railway.app/mcp";

const JWKS = createRemoteJWKSet(new URL(`${AUTH0_ISSUER}.well-known/jwks.json`));

export async function verifyAuth0AccessToken(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: AUTH0_ISSUER,
    audience: MCP_RESOURCE,
    algorithms: ["RS256"],
  });

  if (!payload.sub || typeof payload.exp !== "number") {
    throw new Error("Missing required token claims");
  }

  const clientId = payload.azp ?? payload.client_id;

  if (typeof clientId !== "string") {
    throw new Error("Missing OAuth client identity");
  }

  return {
    token,
    clientId,
    scopes: typeof payload.scope === "string" ? payload.scope.split(/\s+/).filter(Boolean) : [],
    expiresAt: payload.exp,
    resource: new URL(MCP_RESOURCE),
  };
}
