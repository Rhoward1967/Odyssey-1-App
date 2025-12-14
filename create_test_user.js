import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tvsxloejfsrdganemsmg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c3hsb2VqZnNyZGdhbmVtc21nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MTg4NDgsImV4cCI6MjA3MjI5NDg0OH0.Lc7jMTuBACILyxksi4Ti4uMNMljNhS3P5OYHPhzm7tY";

const credentials = {
    email: "testuser_" + Date.now() + "@odyssey1.com", // Unique test email
    password: "T3st!User#2025$Secure"
};

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createUser() {
    const { data, error } = await supabase.auth.signUp(credentials);

    if (error) {
        console.error("❌ USER CREATION FAILED:");
        console.error("   - Error:", error.message);
        return;
    }

    console.log("✅ SUCCESS! TEST USER CREATED:");
    console.log("   Email:", credentials.email);
    console.log("   Password:", credentials.password);
    console.log("   Please check your Supabase dashboard to confirm the user.");
}

createUser();
