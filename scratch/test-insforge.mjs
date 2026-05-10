import { createClient } from "@insforge/sdk";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

async function test() {
  const client = createClient({ baseUrl, anonKey, isServerMode: true });
  const auth = client.auth;
  
  console.log("signInWithPassword toString:", auth.signInWithPassword.toString());
}

test();
