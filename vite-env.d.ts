/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AZURE_API_KEY: string
  readonly VITE_WHISPER_ENDPOINT: string
  readonly VITE_GPT_ENDPOINT: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
