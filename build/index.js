import { createMcpHandler } from "@modelcontextprotocol/server";
import { server } from "./server.js";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createServer } from "node:http";
const handler = createMcpHandler(() => server);
const nodeHandler = toNodeHandler(handler);
const httpServer = createServer((req, res) => {
    const path = new URL(req.url ?? "/", "http://localhost").pathname;
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
