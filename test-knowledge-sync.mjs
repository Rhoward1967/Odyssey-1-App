/**
 * Direct test of roman-knowledge-sync edge function
 */

const url = "https://tvsxloejfsrdganemsmg.supabase.co/functions/v1/roman-knowledge-sync";
const testPayload = {
    filePath: "test.md",
    content: "Test content for R.O.M.A.N. knowledge base",
    metadata: { type: "test" }
};

console.log("🧪 Testing roman-knowledge-sync edge function...");
console.log("URL:", url);
console.log("Payload:", JSON.stringify(testPayload, null, 2));

try {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(testPayload)
    });
    
    console.log("\n📊 Response Status:", response.status, response.statusText);
    
    const text = await response.text();
    console.log("📄 Response Body:", text);
    
    if (response.ok) {
        console.log("\n✅ SUCCESS - Edge function working");
    } else {
        console.log("\n❌ FAILED - Edge function returned error");
        
        // Try to parse as JSON for structured error
        try {
            const errorObj = JSON.parse(text);
            console.log("Error Object:", JSON.stringify(errorObj, null, 2));
        } catch (e) {
            console.log("(Response is not JSON)");
        }
    }
} catch (error) {
    console.error("\n❌ Request Failed:", error.message);
}
