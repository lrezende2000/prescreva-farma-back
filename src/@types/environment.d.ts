export { };

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      DATABASE_URL: string;
      SECRET: string;
      REFRESH_TOKEN_SECRET: string;
      SENDGRID_API_KEY: string;
    }
  }
}