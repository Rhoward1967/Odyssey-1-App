# Supabase Setup Guide for Time Clock System

## Required Database Tables

### 1. employees table
```sql
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  status VARCHAR(20) DEFAULT 'clocked_out' CHECK (status IN ('clocked_in', 'clocked_out', 'on_break')),
  location VARCHAR(255),
  last_clock_in TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. time_entries table
```sql
CREATE TABLE time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL CHECK (action IN ('Clock In', 'Clock Out', 'Break Start', 'Break End')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Required Edge Functions

### time-clock-manager function
Location: `supabase/functions/time-clock-manager/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { action, ...params } = await req.json()

    switch (action) {
      case 'get_employee_status':
        const { data: employees } = await supabaseClient
          .from('employees')
          .select('*')
          .order('name')
        
        return new Response(
          JSON.stringify({ employees }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get_recent_entries':
        const { data: entries } = await supabaseClient
          .from('time_entries')
          .select(`
            *,
            employees!inner(name)
          `)
          .order('timestamp', { ascending: false })
          .limit(params.limit || 10)
        
        return new Response(
          JSON.stringify({ entries }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

## Environment Variables (.env)
```
VITE_SUPABASE_URL=https://tvsxloejfsrdganemsmg.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Row Level Security (RLS) Policies

### For employees table:
```sql
-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Allow read access
CREATE POLICY "Allow read access to employees" ON employees
FOR SELECT USING (true);

-- Allow insert/update for authenticated users
CREATE POLICY "Allow insert/update for authenticated users" ON employees
FOR ALL USING (auth.role() = 'authenticated');
```

### For time_entries table:
```sql
-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Allow read access
CREATE POLICY "Allow read access to time entries" ON time_entries
FOR SELECT USING (true);

-- Allow insert for authenticated users
CREATE POLICY "Allow insert for authenticated users" ON time_entries
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## Testing Your Setup

1. **Check API Key**: Go to Supabase Dashboard → Settings → API
2. **Test Tables**: Run queries in SQL Editor
3. **Test Edge Functions**: Use the Functions tab to invoke manually
4. **Check RLS**: Ensure policies allow your operations

## Common Issues

1. **Invalid API Key**: Key expired or wrong project
2. **RLS Blocking**: Policies too restrictive
3. **Edge Function 404**: Function not deployed
4. **CORS Errors**: Missing headers in edge function