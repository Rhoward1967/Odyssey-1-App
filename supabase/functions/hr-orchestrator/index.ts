import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

console.info("HR Orchestrator V4 (Verified Engine) Booting Up...");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, _payload } = await req.json();
    
    // 1. Authenticate the user
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } }
    );
    
    const { data: authRes } = await supabase.auth.getUser();
    const user = authRes?.user;
    if (!user) throw new Error("User not authenticated");

    // 2. Route the HR action
    switch (action) {

      case "CLOCK_IN_OUT": {
        // 1. Find latest entry for this employee
        const { data: lastEntry, error: lastEntryError } = await supabase
          .from("time_entries")
          .select("id, clock_in, clock_out")
          .eq("employee_id", user.id) // Using 'employee_id' as per audit
          .order("clock_in", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (lastEntryError) throw lastEntryError;

        // 2. If open -> clock out
        if (lastEntry && lastEntry.clock_out == null) {
          const clockOutTime = new Date();
          const clockInTime = new Date(lastEntry.clock_in as string);
          const diffMs = clockOutTime.getTime() - clockInTime.getTime();
          const totalHours = diffMs / (1000 * 60 * 60);

          const { data: updated, error: updErr } = await supabase // ✅ DECLARED AS 'updErr'
            .from("time_entries")
            .update({
              clock_out: clockOutTime.toISOString(),
              total_hours: totalHours,
              status: 'completed'
            })
            .eq("id", lastEntry.id)
            .select("id, clock_in, clock_out, total_hours")
            .single();

          if (updErr) throw updErr; // ✅ CORRECTLY CHECKING 'updErr'
          
          return new Response(
            JSON.stringify({ status: "CLOCKED_OUT", entry: updated, message: `Clocked out. Total hours: ${totalHours.toFixed(2)}` }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        }

        // 3. Otherwise -> clock in
        const { data: employee } = await supabase
            .from('employees') 
            .select('first_name, last_name')
            .eq('user_id', user.id)
            .single();

        const employeeName = employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee';

        const { data: inserted, error: insErr } = await supabase
          .from("time_entries")
          .insert({
            employee_id: user.id, 
            employee_name: employeeName,
            clock_in: new Date().toISOString(),
            status: 'active'
          })
          .select("id, clock_in, clock_out, total_hours")
          .single();

        if (insErr) throw insErr;
        
        return new Response(
          JSON.stringify({ status: "CLOCKED_IN", entry: inserted, message: `Clocked in at ${new Date(inserted.clock_in).toLocaleTimeString()}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      // ... other cases ...
      case "RUN_PAYROLL": {
        return new Response(JSON.stringify({ message: "Payroll endpoint is under construction" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }
      case "REQUEST_LEAVE": {
        return new Response(JSON.stringify({ message: "Leave request endpoint is under construction" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }

      default:
        throw new Error(`Invalid action: ${action}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("HR Orchestrator Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});