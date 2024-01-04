declare module 'express-session' {
  export interface SessionData {
    email: string;
  }
}

declare global {
  namespace Express {
    interface User {
      accessToken: string;
    }
  }
}
