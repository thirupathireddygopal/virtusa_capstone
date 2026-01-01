import dotenv from 'dotenv';
dotenv.config();

import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/user.model';
import { catchAsyncError } from './catchAsyncError'
import { ErrorHandler } from '../utils/errorHandler';
import { redis } from '../utils/database/redis';

import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { accessTokenOptions, refreshTokenOptions, sendToken } from '../utils/jwt';

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

export const isAuthenticated = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    console.log('entered into auth middleware');
    console.log(req.cookies);
    // const access_token = req.cookies.access_token as string;
    const access_token = req.headers['access_token'] as string;
    if (!access_token) {
        res.status(409).json({
            status: false,
            message: 'Please login to authenticate...'
        });
        // return next(new ErrorHandler('please login to authenticate', 400));
    }
    console.log(access_token);
    // const decode = jwt.verify(access_token,process.env.JWT_ACCESS_TOKEN as jwt.Secret) as JwtPayload;
    const decoded = jwt.decode(access_token) as JwtPayload;
    console.log('decode value');
    console.log(decoded);
    if (!decoded) {
        console.log('entered into decoded...');
        res.status(409).json({
            status: false,
            message: 'request access token not valid...'
        })
        // return res.status(409).json({status:false, message:'request access token not valid...'});
        // return next(new ErrorHandler('request access token not valid...',409));
    }
    // check if access token is valid or not
    console.log('date now: ' + Date.now() / 1000);
    if (decoded.exp && decoded.exp <= Date.now() / 1000) {
        try {
            updateAccessToken(req, res, next);
        } catch (error) {
            return next(error);
        }
    }
    else {
        console.log('come to here...');
        console.log('decoded it: ' + decoded.id);
        const user: any = await redis.get(decoded.id);
        if (!user) {
            res.status(400).send({
                status: false,
                message: 'please login to access the resource'
            });
            // return next(new ErrorHandler('please login to access the resource', 400));
        }
        console.log('decode user: ' + user);
        req.user = JSON.parse(user);
        next();
    }
});

interface IActivationToken {
    token: string;
    activationCode: string;
}
export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    // expiresIn: "5m" 
    const token = jwt.sign({ user, activationCode }, process.env.ACTIVATION_SECRET as Secret, { expiresIn: "1h" });
    return { token, activationCode };
}

export const updateAccessToken = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refresh_token = req.cookies.refresh_token as string;
            const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_TOKEN as string) as JwtPayload;
            console.log('verified and decoded value: ', decoded);
            const message = 'Could not refresh token';
            if (!decoded) {
                return next(new ErrorHandler(message, 400));
            }
            const session = await redis.get(decoded.id as string);
            if (!session) {
                return next(new ErrorHandler('please login again', 400));
            }
            const user = JSON.parse(session);
            const new_access_token = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_TOKEN as string, { expiresIn: "7d" });
            const new_refresh_token = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_TOKEN as string, { expiresIn: "7d" });
            req.user = user;
            console.log('req.user:-----------------');
            console.log(req.user);
            res.cookie('access_token', new_access_token, accessTokenOptions);
            res.cookie('refresh_token', new_refresh_token, refreshTokenOptions);
            return next();
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

