import { createMcpHandler } from "@modelcontextprotocol/server";
import { createGymBroServer } from "./server.js";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createServer } from "node:http";

const handler = createMcpHandler(createGymBroServer, {
  onerror: (err) => console.error("MCP handler error:", err),
});

const nodeHandler = toNodeHandler(handler, {
  onerror: (err) => console.error("MCP node adapter error:", err),
});

const httpServer = createServer((req, res) => {
  const path = new URL(req.url ?? "/", "http://localhost").pathname;

  if (path === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (path !== "/mcp") {
    res.writeHead(404);
    res.end("Not Found");
    return;
  }
  nodeHandler(req, res);
});

const PORT = Number(process.env.PORT) || 3000;

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`MCP server listening on port ${PORT}`);
});
