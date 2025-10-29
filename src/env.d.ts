/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_ANTHROPIC_API_KEY?: string
  readonly VITE_GOOGLE_CALENDAR_API_KEY?: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string
  readonly VITE_TWILIO_ACCOUNT_SID?: string
  readonly VITE_SAM_GOV_API_KEY?: string
  readonly VITE_ARXIV_API_KEY?: string
  readonly VITE_GITHUB_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
