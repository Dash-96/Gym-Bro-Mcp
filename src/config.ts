const USER_AGENT = "gymbro-app/1.0";
export const headers = {
    "User-Agent": USER_AGENT,
    Accept:"application/json"
}

// Base URL of the Nest API, including its global prefix, e.g. https://<host>/api
const apiBase = process.env.GYM_BRO_API_BASE;
if (!apiBase) {
    throw new Error("GYM_BRO_API_BASE env var is not set (expected e.g. https://<nest-host>/api)");
}
export const GYM_BRO_API_BASE = apiBase.replace(/\/+$/, "");
