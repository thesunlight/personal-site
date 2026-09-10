/// <reference types="vite/client" />

import 'axios';

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: { retryCount: number };
  }
}
