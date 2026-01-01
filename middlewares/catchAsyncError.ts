import { Request, Response, NextFunction, RequestHandler } from 'express';

export const catchAsyncError = (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
    // Promise.resolve(fn(req,res,next)).then((error)=> next(error));
}