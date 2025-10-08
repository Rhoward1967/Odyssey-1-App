window.supabaseUser = (await import("@/lib/supabase")).supabase.auth.getUser().then(({data}) => data.user)
