const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function main() {
  console.log("Checking user_roles...");
  const roleRes = await supabase.from("user_roles").select("*").limit(5);
  console.log("Roles:", roleRes.data, roleRes.error?.message);

  console.log("Checking profiles with user_id...");
  const p1 = await supabase.from("profiles").select("*").eq("user_id", "12345678-1234-1234-1234-123456789012").limit(1);
  console.log("Profiles user_id error:", p1.error?.message);

  console.log("Checking profiles with id...");
  const p2 = await supabase.from("profiles").select("*").eq("id", "12345678-1234-1234-1234-123456789012").limit(1);
  console.log("Profiles id error:", p2.error?.message);

  const pAll = await supabase.from("profiles").select("*").limit(1);
  console.log("Profiles shape:", pAll.data?.[0]);
}

main();
