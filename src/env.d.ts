/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly ADMIN_USERNAME?: string;
  readonly ADMIN_PASSWORD?: string;
  readonly PUBLIC_N8N_WEBHOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
