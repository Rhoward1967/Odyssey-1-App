// scripts/roman-tail-broadcast.mjs
// Streams R.O.M.A.N. events from Supabase Realtime broadcast to your terminal
// Usage: node scripts/roman-tail-broadcast.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  process.exit(1);
}
const supabase = createClient(url, anon);

function fmt(e) {
  const time = new Date(e.created_at).toLocaleTimeString();
  const type = (e.action_type || '').padEnd(12, " ");
  const where = e.context?.repo ? `repo=${e.context.repo}` : "";
  const file = e.context?.file ? ` file=${e.context.file}` : "";
  return `[${time}] ${type} ${where}${file} :: ${JSON.stringify(e.payload)}`;
}

await supabase.realtime.setAuth(); // ensure JWT attached

const channel = supabase
  .channel("roman:events", { config: { private: true } })
  .on("broadcast", { event: "INSERT" }, (msg) => {
    const e = msg.payload?.record || msg.payload?.new || msg.payload;
    if (!e) return;
    console.log(fmt(e));
  })
  .on("broadcast", { event: "UPDATE" }, (msg) => {
    const e = msg.payload?.record || msg.payload?.new || msg.payload;
    if (!e) return;
    console.log("[UPDATE] " + fmt(e));
  })
  .on("broadcast", { event: "DELETE" }, (msg) => {
    const e = msg.payload?.record || msg.payload?.old || msg.payload;
    if (!e) return;
    console.log("[DELETE] " + fmt(e));
  });
const status = await channel.subscribe((s) => {
  if (s === "SUBSCRIBED") console.log("Subscribed to roman:events (broadcast).");
});
// Print last 20 historical events
const { data, error } = await supabase
  .from("ops.roman_events")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(20);
if (!error && data) [...data].reverse().forEach((e) => console.log(fmt(e)));
