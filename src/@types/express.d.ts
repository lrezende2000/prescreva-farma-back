declare namespace Express {
  interface User {
    id: number;
    email: string;
    name: string;
  }

  export interface Request {
    origin: string;
  }
}