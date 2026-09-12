/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Brand identity */
  readonly VITE_APP_NAME: string;
  readonly VITE_TAGLINE: string;

  /** WhatsApp contact (used to build wa.me deep links) */
  readonly VITE_WHATSAPP_NUMBER: string;
  readonly VITE_WHATSAPP_INTL: string;

  /** Phone contact (used for tel: links) */
  readonly VITE_PHONE_NUMBER: string;
  readonly VITE_PHONE_INTL: string;

  /** Email & office details */
  readonly VITE_EMAIL: string;
  readonly VITE_ADDRESS: string;

  /** Admin portal access PIN (4 digits) */
  readonly VITE_ADMIN_PIN: string;

  /** Supabase database configuration */
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_BUCKET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}