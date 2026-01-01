import dotenv from 'dotenv';
dotenv.config();

import { Response } from 'express';
import { IUser } from '../models/user.model';
import { redis } from './database/redis';

interface ItokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: "lax" | "strict" | undefined | "none";
    secure?: boolean;
}

//parse Enviorment variable to integrated with fallbacke values
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '10', 10);
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '48', 10);

// options for cookies
export const accessTokenOptions: ItokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 1000), // --> 5*60*1000 -> 5 minutes
    maxAge: accessTokenExpire * 60 * 60 * 1000, // 5hrs
    httpOnly: true,
    sameSite: "none",
    secure: true
}

export const refreshTokenOptions: ItokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 60 * 1000), // expires in 24hrs
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true
}

// used for login in
// used for sending token along with user details while login in
export const sendToken = (user: IUser, statusCode: number, res: Response) => {
    console.log('entered into sendToken...')
    const accessToken = user.SignAccessToken(); // expires in 5mins
    console.log(accessToken);
    const refreshToken = user.SignRefreshToken();  // expires in 7days
    console.log(refreshToken);
    console.log('user...');
    console.log(user);
    redis.set(user._id as any, JSON.stringify(user) as any);
    console.log('redis get user id..');
    console.log(redis.get(`${user._id}`));
    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);
    res.status(statusCode).json({
        success: true,
        user,
        access_token: accessToken,
        refresh_token: refreshToken
    })
}