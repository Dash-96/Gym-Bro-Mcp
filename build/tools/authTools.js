import { z } from "zod";
import { makePostRequest } from "../utils.js";
import { avatarImages } from "../types.js";
import { writeFile } from "fs";
import { readFile } from "fs/promises";
import { GYM_BRO_API_BASE, server } from "../server.js";
server.registerTool("create_user", {
    description: "create a new user",
    inputSchema: z.object({
        fullName: z.string().min(2).describe("the full name of the new user"),
        displayName: z.string().min(2).describe("the username of the new user"),
        email: z.string().email().describe("the email of the new user"),
        password: z.string().min(3).describe("the password of the new user"),
        age: z.number().int().positive().describe("the age of the new user"),
        height: z.number().positive().describe("the height of the new user"),
        weight: z.number().positive().describe("the weight of the new user"),
        profileImage: z.enum(avatarImages).describe("the avatar image of the new user"),
        phone: z.string().length(10).describe("users phone number"),
        birthDate: z.string().describe("users birth date formatted in dd/mm/yyyy"),
        gender: z.enum(["male", "female"]).describe("the users gender")
    }),
}, async (registerPayload) => {
    const { displayName, password } = registerPayload;
    const registerUrl = `${GYM_BRO_API_BASE}/auth/register`;
    const registerData = await makePostRequest(registerUrl, registerPayload);
    const newUser = registerData;
    if (newUser) {
        const fileDataString = await readFile("./user.json", "utf-8");
        const fileData = JSON.parse(fileDataString);
        writeFile("./user.json", JSON.stringify({ ...fileData, [`${displayName}`]: { displayName, password } }), { encoding: "utf-8" }, (err) => {
            if (err) {
                console.error("Failed to save user to file");
                return;
            }
        });
    }
    return { content: [{ type: "text", text: "Created user sucsessfuly" }] };
});
server.registerTool("login_user", {
    description: "login with existing user",
    inputSchema: z.object({
        displayName: z.string().min(2).describe("the username of the existing user"),
        password: z.string().min(3).describe("the password of the existing user"),
    }),
}, async ({ displayName, password }) => {
    const loginUrl = `${GYM_BRO_API_BASE}/auth/login`;
    const loginData = await makePostRequest(loginUrl, { displayName, password });
    const tokens = loginData;
    if (tokens) {
        const fileDataString = await readFile("./user.json", "utf-8");
        const fileData = JSON.parse(fileDataString);
        const passKey = `${displayName}_pass`;
        if (fileData[passKey]) {
            fileData[passKey].accessToken = tokens.accessToken;
            fileData[passKey].refreshToken = tokens.refreshToken;
        }
        else {
            fileData[passKey] = tokens;
        }
        writeFile("./user.json", JSON.stringify(fileData), { encoding: "utf-8" }, (err) => {
            if (err) {
                console.error("Failed to save user to file");
                return;
            }
        });
    }
    return { content: [{ type: "text", text: "Logged in successfully" }] };
});
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
