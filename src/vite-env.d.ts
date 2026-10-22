/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare const __SITE_URL__: string;

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
