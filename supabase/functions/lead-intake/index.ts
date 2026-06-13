// supabase/functions/lead-intake/index.ts
// Manual lead-entry endpoint for the janitorial leads pipeline.
// Authenticated users submit a lead; it's inserted into janitorial_leads
// owned by their user_id. Returns the new lead's id.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    // Required field
    if (!body.company_name) {
      return new Response(
        JSON.stringify({ error: "company_name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Allowed fields map directly to janitorial_leads columns
    const allowed = [
      "company_name", "contact_person", "email", "phone", "address",
      "city", "state", "zip_code", "building_type", "square_footage",
      "service_frequency", "current_provider", "budget_range",
      "special_requirements", "lead_source", "estimated_value",
    ];

    const insertRow: Record<string, unknown> = { user_id: userData.user.id };
    for (const key of allowed) {
      if (body[key] !== undefined) insertRow[key] = body[key];
    }

    // Default lead_source if not provided
    if (!insertRow.lead_source) insertRow.lead_source = "manual_entry";

    // Simple lead scoring heuristic based on completeness + estimated value
    let score = 0;
    if (insertRow.email) score += 10;
    if (insertRow.phone) score += 10;
    if (insertRow.square_footage) score += 15;
    if (insertRow.budget_range) score += 15;
    if (insertRow.estimated_value && Number(insertRow.estimated_value) > 0) score += 20;
    if (insertRow.current_provider) score += 10;
    insertRow.lead_score = Math.min(score, 100);

    const { data, error } = await supabase
      .from("janitorial_leads")
      .insert(insertRow)
      .select("id, company_name, lead_score, status")
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ lead: data }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
