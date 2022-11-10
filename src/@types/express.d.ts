declare namespace Express {
  interface User {
    id: number;
    email: string;
    name: string;
    isAdmin: boolean;
  }

  export interface Request {
    origin: string;
  }
}