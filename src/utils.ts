import { headers } from "./config.js";

async function parseResponse<T>(response: Response) : Promise<T | null>{
    const body = await response.text();
    if(!response.ok){
        // keep the backend's message (e.g. Nest validation errors) so the model can fix its input
        throw new Error(`gym-bro API error ${response.status}: ${body || response.statusText}`);
    }
    return body ? (JSON.parse(body) as T) : null
}

export async function makeGetRequest<T>(url: string) : Promise<T | null>{
    try{
        const response = await fetch(url , {headers})
        return await parseResponse<T>(response)
    }catch(err){
        console.error("Error making gym-bro request: " , err)
        throw err;
    }
}

export async function makePostRequest<T , P extends Object = never>(url: string , payload?:P , token? :string) : Promise<T | null>{
    const h = token ? {...headers ,"Authorization": `Bearer ${token}` } : headers
    try{
        const response = await fetch(url , {
            method: "POST",
            headers: {...h , "Content-Type": "application/json"},
            body: JSON.stringify(payload)
        })
        return await parseResponse<T>(response)
    }catch(err){
        console.error("Error making gym-bro request: " , err)
        throw err;
    }
}
