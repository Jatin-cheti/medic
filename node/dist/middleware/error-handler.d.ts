import { NextFunction, Request, Response } from 'express';
export declare function notFoundHandler(req: Request, _res: Response, next: NextFunction): void;
export declare function errorHandler(err: Error & {
    statusCode?: number;
}, _req: Request, res: Response, _next: NextFunction): void;
