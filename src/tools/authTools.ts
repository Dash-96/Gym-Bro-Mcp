import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { makePostRequest } from "../utils.js";
import { avatarImages, LoginRequest, LoginResponse, RegisterPayload, RegisterResponse } from "../types.js";
import { GYM_BRO_API_BASE } from "../config.js";
import { fetchAuth0UserInfo } from "../auth.js";

const registerSchema = z.object({
  fullName: z.string().min(2).describe("the full name of the new user"),
  displayName: z.string().min(2).describe("the username of the new user"),
  email: z.email().describe("the email of the new user"),
  password: z.string().min(3).describe("the password of the new user"),
  age: z.number().int().positive().describe("the age of the new user"),
  height: z.number().positive().describe("the height of the new user"),
  weight: z.number().positive().describe("the weight of the new user"),
  profileImage: z.enum(avatarImages).describe("the avatar image of the new user"),
  phone: z.string().length(10).describe("users phone number"),
  birthDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "must be formatted dd/mm/yyyy").describe("users birth date formatted in dd/mm/yyyy"),
  gender: z.enum(["male", "female"]).describe("the users gender"),
});

const loginSchema = z.object({
  displayName: z.string().min(2).describe("the username of the existing user"),
  password: z.string().min(3).describe("the password of the existing user"),
});

export function registerAuthTools(server: McpServer) {
  server.registerTool(
    "create_user",
    {
      description: "create a new user. Afterwards call login_user to get an access token",
      inputSchema: registerSchema,
    },
    async (registerPayload) => {
      const registerUrl = `${GYM_BRO_API_BASE}/auth/register`;
      await makePostRequest<RegisterResponse, RegisterPayload>(registerUrl, registerPayload);

      return { content: [{ type: "text", text: `Created user "${registerPayload.displayName}" successfully` }] };
    },
  );

  server.registerTool(
    "login_user",
    {
      description: "login with existing user. Returns a jwt accessToken to pass as `token` to other tools, and a refreshToken",
      inputSchema: loginSchema,
    },
    async ({ displayName, password }) => {
      const loginUrl = `${GYM_BRO_API_BASE}/auth/login`;
      const tokens = await makePostRequest<LoginResponse, LoginRequest>(loginUrl, { displayName, password });

      if (!tokens?.accessToken) {
        throw new Error(`Login failed: ${tokens?.message ?? "no access token returned"}`);
      }

      const result = { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
      return { content: [{ type: "text", text: `Logged in successfully as "${displayName}"\n${JSON.stringify(result)}` }] };
    },
  );

  server.registerTool(
    "whoami",
    {
      description: "get the user currently signed in to this MCP server through Auth0",
    },
    async (ctx) => {
      const authInfo = ctx.http?.authInfo;
      if (!authInfo) {
        throw new Error("Not signed in: no Auth0 token on this request");
      }

      const user = {
        sub: authInfo.extra?.sub,
        clientId: authInfo.clientId,
        scopes: authInfo.scopes,
        expiresAt: authInfo.expiresAt ? new Date(authInfo.expiresAt * 1000).toISOString() : null,
        profile: await fetchAuth0UserInfo(authInfo.token),
      };
      return { content: [{ type: "text", text: `Signed in as "${user.sub}"\n${JSON.stringify(user)}` }] };
    },
  );

  // server.registerTool(
  //   "refresh_user",
  //   {
  //     description: "get a new access token using the stored refresh token , if the old access token has expired and no longer accepted by backend server",
  //     inputSchema: z.object({
  //       token: z.string().describe("the access token to be sent as bearer token"),
  //     }),
  //   },
  //   async ({ token }) => {
  //     const refreshUrl = `${GYM_BRO_API_BASE}/auth/refresh`;
  //     const accessToken = await makePostRequest(refreshUrl ,undefined,token)
  //     if(!accessToken){
  //         console.error('Failed to refresh token , need to login again')
  //     }


  //     return {content:[{type:"text" , text:"access token refreshed"}]}
  //   }
  // );
}
