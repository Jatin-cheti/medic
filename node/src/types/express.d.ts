declare namespace Express {
  export interface Request {
    user?: {
      id?: number;
      userId?: number;
      uuid?: string;
      email?: string;
      phone?: string;
      role: string;
    };
  }
}
