import { McpServer } from "@modelcontextprotocol/server";
export const GYM_BRO_API_BASE = process.env.GYM_BRO_API_BASE;
export const server = new McpServer({
    name: "gymbro",
    version: "1.0.0",
});
