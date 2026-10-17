import { headers } from "./config.js";
export async function makeGetRequest(url) {
    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json());
    }
    catch (err) {
        console.error("Error making gym-bro request: ", err);
        throw err;
    }
}
export async function makePostRequest(url, payload, token) {
    const h = token ? { ...headers, "Authorization": `Bearer ${token}` } : headers;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { ...h, "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json());
    }
    catch (err) {
        console.error("Error making gym-bro request: ", err);
        throw err;
    }
}
