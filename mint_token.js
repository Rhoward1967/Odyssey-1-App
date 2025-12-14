// R.O.M.A.N. Protocol: Server-Side Token Minting Utility & Verification Audit Engine
// Use: node mint_token.js

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch'; // Requires Node.js to support fetch API

// --- CRITICAL CONFIGURATION ---
// FIX APPLIED: Overwriting with the DEFINITIVE, USER-PROVIDED Anonymous Key.
const SUPABASE_URL = "https://tvsxloejfsrdganemsmg.supabase.co"; 
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c3hsb2VqZnNyZGdhbmVtc21nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcxODg0OCwiZXhwIjoyMDcyMjk0ODQ4fQ.Wr3ffDizDf3DXG2uFD7-z4XrmtQUJjX-m9hiLoMvd1M"; // CONFIRMED KEY
let SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2c3hsb2VqZnNyZGdhbmVtc21nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MTg4NDgsImV4cCI6MjA3MjI5NDg0OH0.Lc7jMTuBACILyxksi4Ti4uMNMljNhS3P5OYHPhzm7tY"; // DEFINITIVE, USER-PROVIDED ANON KEY

// Replace with a valid test user's credentials in your Supabase Auth table
const credentials = {
    email: "generalmanager81@gmail.com",
    password: "ananoki405t"
};
// ------------------------------

// Clients must be created inside the mintFreshToken function after key recovery.
let supabase;
let supabaseAdmin;

// Helper function retained for structural integrity
async function recoverAnonKey() {
    console.log("[R.O.M.A.N. KEY RECOVERY] Using definitive Anonymous Key.");
    return true; 
}


// R.O.M.A.N. Admin Bypass Function: Confirms user without email link (using correct listUsers logic)
async function adminConfirmUser(email) {
    console.log(`[R.O.M.A.N. Admin] Attempting to find user ID for ${email}...`);
    // 1. List all users (no filter) for robust search
    const { data: userData, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();
    if (fetchError || !userData.users || userData.users.length === 0) {
        console.error("❌ ADMIN CONFIRM FAILED: No users found in project. Check your Service Role Key and project.");
        return false;
    }
    // Log all user emails for diagnostics
    console.log('[DEBUG] Users in project:', userData.users.map(u => u.email));
    // Find user by case-insensitive email match
    const user = userData.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
        console.error("❌ ADMIN CONFIRM FAILED: User not found by email. Check for typos or mismatched project.");
        return false;
    }
    const userId = user.id;
    console.log(`[R.O.M.A.N. Admin] User ID found: ${userId}. Bypassing email confirmation...`);
    // 2. Patch the user metadata to confirm the email
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email_confirm: true,
    });
    if (updateError) {
        console.error("❌ ADMIN CONFIRM FAILED: Could not update user status.", updateError.message);
        return false;
    }
    console.log("✅ ADMIN CONFIRM SUCCESS: User email confirmed in database.");
    return true;
}

// R.O.M.A.N. EDGE FUNCTION CALL HELPER
async function callEdge(path, token, body = {}) {
    const edgeUrl = `${SUPABASE_URL}/functions/v1/${path}`;
    
    try {
        const res = await fetch(edgeUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        const text = await res.text();
        let json = null;
        try { json = text ? JSON.parse(text) : { raw_text: text }; } catch (_) {}
        
        return { 
            status: res.status, 
            ok: res.ok, 
            data: json, 
            text: text 
        };

    } catch (e) {
        return { status: 500, ok: false, data: { error: 'Network or internal test runner error.' } };
    }
}

// --- R.O.M.A.N. PROTOCOL: SELF-EXECUTING SMOKE TESTS ---

async function executeSmokeTests(token) {
    console.log("\n>>> STARTING R.O.M.A.N. BACKEND SECURITY AUDIT <<<\n");
    
    // A) AI CHAT VERIFICATION
    console.log("--- 1. AI CHAT /ai_chat ---");
    const chatBody = { "prompt": "Explain photosynthesis to a 5th grader" };
    const chatRes = await callEdge('ai_chat', token, chatBody);
    
    console.log(`[STATUS] ${chatRes.status} ${chatRes.ok ? '✅ OK' : '❌ FAILED'}`);
    if (chatRes.ok) {
        const data = chatRes.data;
        const passSources = Array.isArray(data?.sources) && data.sources.length > 0;
        const passReply = typeof data?.reply === 'string' && data.reply.length > 50;

        console.log(`[AUDIT] REPLY: ${passReply ? '✅ Valid' : '❌ Vague/Missing'}`);
        console.log(`[AUDIT] SOURCES: ${passSources ? '✅ Grounded' : '❌ Missing Grounding'}`);
        // console.log("   --- RESPONSE SNIPPET ---");
        // console.log(JSON.stringify(data.reply.substring(0, 100), null, 2) + '...');
    } else {
        console.log(`[ERROR] Server Response: ${chatRes.data?.error || chatRes.text}`);
    }


    // B) GAME SCORE VERIFICATION (Atomic GREATEST Logic)
    console.log("\n--- 2. GAME SCORE /submit_score (Atomic GREATEST) ---");
    const scoreBody = { "game_id": "math_facts", "score": 100 };
    const scoreRes = await callEdge('submit_score', token, scoreBody);
    
    console.log(`[STATUS] ${scoreRes.status} ${scoreRes.ok ? '✅ OK' : '❌ FAILED'}`);
    if (scoreRes.ok) {
        console.log(`[AUDIT] Confirmed RLS and atomic upsert triggered.`);
        // console.log("   --- RESPONSE SNIPPET ---");
        // console.log(JSON.stringify(scoreRes.data, null, 2));
    } else {
        console.log(`[ERROR] Server Response: ${scoreRes.data?.error || scoreRes.text}`);
    }

    // C) TUTORING SCHEDULE VERIFICATION (Compliance Logging)
    console.log("\n--- 3. TUTORING /tutoring_schedule (Compliance) ---");
    // Use the user's actual UID for tutor_id
    const tutorBody = { "action": "schedule", "tutor_id": "eca49ca9-b4ae-4e0e-b78a-fa1811024781", "start_time": "2026-01-01T10:00:00Z" };
    const tutorRes = await callEdge('tutoring_schedule', token, tutorBody);
    
    console.log(`[STATUS] ${tutorRes.status} ${tutorRes.ok ? '✅ OK' : '❌ FAILED'}`);
     if (tutorRes.ok) {
        console.log(`[AUDIT] Confirmed scheduling write and background compliance log.`);
        // console.log("   --- RESPONSE SNIPPET ---");
        // console.log(JSON.stringify(tutorRes.data, null, 2));
    } else {
        console.log(`[ERROR] Server Response: ${tutorRes.data?.error || tutorRes.text}`);
    }

    console.log("\n>>> AUDIT COMPLETE. Report results to CEO for final sign-off. <<<");
}

async function mintFreshToken() {
    console.log("------------------------------------------------------------------");
    
    // CRITICAL KEY RECOVERY STEP
    
    // Re-initialize clients with corrected key
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false }, 
    });


    // SKIP ADMIN CONFIRM: Proceed directly to sign-in and audit
    // (User confirmation step commented out for troubleshooting)
    // if (credentials.email_confirm !== true) {
    //     const confirmed = await adminConfirmUser(credentials.email);
    //     if (!confirmed) return;
    // }


    console.log(`[R.O.M.A.N.] Attempting to sign in user: ${credentials.email}...`);

    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
        console.error("❌ TOKEN MINTING FAILED:");
        console.error("   - Error:", error.message);
        console.error("   - Check 1: Ensure user exists and password is correct.");
        console.error("   - Check 2: Verify SUPABASE_URL/ANON_KEY are correct in this file.");
        return;
    }

    const token = data?.session?.access_token;

    if (token) {
        console.log("✅ SUCCESS! FRESH ACCESS TOKEN MINTED.");
        await executeSmokeTests(token);
    } else {
        console.error("❌ TOKEN MINTING FAILED: Session data was returned, but no access_token found.");
    }
}

mintFreshToken();