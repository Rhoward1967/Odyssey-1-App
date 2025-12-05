// scripts/roman-tail.mjs
// Streams R.O.M.A.N. events from Supabase Realtime to your terminal
// Usage: node scripts/roman-tail.mjs [repoFilter]

import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  process.exit(1);
}
const supabase = createClient(url, anon);
const repoFilter = process.argv[2]; // optional

function fmt(e) {
  const time = new Date(e.created_at).toLocaleTimeString();
  const type = (e.action_type || '').padEnd(12, " ");
  const where = e.context?.repo ? `repo=${e.context.repo}` : "";
  const file = e.context?.file ? ` file=${e.context.file}` : "";
  return `[${time}] ${type} ${where}${file} :: ${JSON.stringify(e.payload)}`;
}

console.log("Connecting to Supabase Realtime...");
const channel = supabase
  .channel("roman:events", { config: { private: true } })
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "ops",
      table: "roman_events",
    },
    (payload) => {
      const e = payload.new;
      if (repoFilter && e.context?.repo !== repoFilter) return;
      console.log(fmt(e));
    }
  );
await channel.subscribe((status) => {
  if (status === "SUBSCRIBED") {
    console.log("Subscribed. Streaming events...");
  }
});
// Print last 20 historical events
const { data, error } = await supabase
  .from("roman_events")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(20);
if (!error && data) {
  [...data].reverse().forEach((e) => console.log(fmt(e)));
}
