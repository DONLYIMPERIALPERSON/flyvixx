import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: any;
    descopeToken?: any;
}
export declare const validateDescopeToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalDescopeAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const devAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=descopeAuth.d.ts.map