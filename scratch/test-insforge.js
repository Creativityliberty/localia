const { createClient } = require("@insforge/sdk");
require("dotenv").config({ path: ".env.local" });

async function test() {
  try {
    const client = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL,
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
      isServerMode: true
    });
    
    console.log("Client keys:", Object.keys(client));
    if (client.auth) {
      console.log("Auth keys:", Object.keys(client.auth));
    } else {
      console.log("Auth is missing");
    }
  } catch (e) {
    console.error("Initialization failed:", e);
  }
}

test();
