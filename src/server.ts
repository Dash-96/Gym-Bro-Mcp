import { McpServer } from "@modelcontextprotocol/server";
import { registerAuthTools } from "./tools/authTools.js";
import { registerWorkoutTools } from "./tools/workoutTools.js";

// createMcpHandler serves each request with its own instance, so this must
// build a fresh server every call — a shared one fails concurrent requests.
export function createGymBroServer() {
  const server = new McpServer({
    name: "gymbro",
    version: "1.0.0",
  });

  registerAuthTools(server);
  registerWorkoutTools(server);

  return server;
}
