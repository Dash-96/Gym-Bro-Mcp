import { headers } from "./config.js";

export async function makeGetRequest<T>(url: string) : Promise<T | null>{
    try{
        const response = await fetch(url , {headers})
        if(!response.ok){
               throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json()) as T
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
        if(!response.ok){
               throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json()) as T
    }catch(err){
        console.error("Error making gym-bro request: " , err)
        throw err;
    }
}