declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      ARC_CLOUD_TOKEN?: string;
    }
  }
}
