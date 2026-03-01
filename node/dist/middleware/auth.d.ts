import { Request, RequestHandler } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
        uuid: string;
        email: string;
        phone: string;
        role: string;
    };
}
export declare const verifyToken: RequestHandler;
export declare const verifyRole: (allowedRoles: string[]) => RequestHandler;
