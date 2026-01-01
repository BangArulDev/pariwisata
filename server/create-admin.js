import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseServiceKey) {
  console.error("Error: SUPABASE_KEY is missing in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser() {
  const email = "kingkong@grobogan.com";
  const password = "qqqqqqqq";

  console.log(`Creating user: ${email}...`);

  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

  let userId;

  if (authError) {
    console.log("User creation note:", authError.message);
    // If user already exists, try to get their ID to insert into admin table
    if (authError.message.includes("already been registered")) {
      // We can't easily get the ID of an existing user with just the anon key if we didn't just create them,
      // but since we are using the service role key (which we SHOULD be using), we can list users.
      // However, for simplicity, let's try to sign in to get the ID, or just assume the user knows what they are doing.
      // BETTER APPROACH: Use listUsers to find the user.
      const { data: listData, error: listError } =
        await supabase.auth.admin.listUsers();
      if (listData && listData.users) {
        const existingUser = listData.users.find((u) => u.email === email);
        if (existingUser) {
          userId = existingUser.id;
          console.log("Found existing user ID:", userId);
        }
      }
    }
  } else {
    console.log("User created successfully in Auth!");
    userId = authData.user.id;
  }

  if (userId) {
    // 2. Insert into public.admin table
    console.log("Inserting into public.admin table...");
    const { error: dbError } = await supabase
      .from("admin")
      .insert([{ id: userId, email: email }]);

    if (dbError) {
      if (dbError.code === "23505") {
        // Unique violation
        console.log("User is already in the admin table.");
      } else {
        console.error("Error inserting into admin table:", dbError.message);
      }
    } else {
      console.log("User successfully added to admin table!");
    }
  } else {
    console.error(
      "Could not obtain User ID. Please check if the user exists and the script has permissions."
    );
  }
}

createAdminUser();
