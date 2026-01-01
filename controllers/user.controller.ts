import dotenv from 'dotenv';
dotenv.config();

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

import { accessTokenOptions, refreshTokenOptions, sendToken } from '../utils/jwt';

import { ErrorHandler } from '../utils/errorHandler';
import { catchAsyncError } from '../middlewares/catchAsyncError';

import * as UserModel from '../models/user.model';

import { IUser } from '../models/user.model';
import { redis } from '../utils/database/redis';
import axios from 'axios';

// import ejs from 'ejs'
import path from 'path';
// import sendMail from '../utils/sendMail';

// register user
interface IRegisterationBody {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

export const createUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const { activationToken, activationCode } = req.body;
        // const newUser: { user: IUser; activationCode: string } = jwt.verify(activationToken, process.env.ACTIVATION_SECRET as string) as { user: IUser; activationCode: string };
        // if (newUser.activationCode !== activationCode) {
        //     return next(new ErrorHandler('Invalid Activation code', 400));
        // }
        // const { firstName, lastName, email, role, password } = newUser.user;
        const { firstName, lastName, email, role, password } = req.body;
        const existUser = await UserModel.asyncFindOne({ email });
        if (existUser) {
            return next(new ErrorHandler("email already exist", 400));
        }
        const user = await UserModel.asyncCreateDoc({
            firstName,
            lastName,
            email,
            role,
            password
        });
        console.log(user);
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user
        });
    } catch (error: any) {
        console.log(error);
        return next(new ErrorHandler(error.message, 400));
    }
});

// export const createUser = catchAsyncError(
//     async (req: Request, res: Response, next: NextFunction) => {
//         try {
//             const { user, subject, templateFileName, messageType } = req.body;
//             const isEmailExist = await UserModel.asyncFindOne({ email: user?.email });
//             if (isEmailExist) {
//                 res.status(400).json({ status: false, message: 'Email already exist' });
//             }
//             const activationToken = createActivationToken(user);
//             const activationCode = activationToken.activationCode;

//             // get the path to the email template file in mails >> activation-email.ejs
//             const templatePath = path.join(__dirname, '../templates', templateFileName);
//             // render the email template with ejs
//             const dataObj = { user: { firstName: user?.firstName }, activationCode };
//             const htmlPart = await ejs.renderFile(templatePath, dataObj);
//             console.log('template file path: ', templatePath);

//             const data = {
//                 to: user?.email, // email string seperated by commas
//                 // cc:cc, // email string seperated by commas
//                 subject: subject,
//                 body: htmlPart,
//                 messageType: messageType,
//                 fromName: "Admin",
//                 replyToAddress: ""
//             };

//             const headers = {
//                 'x-api-key': process.env.AWS_XAPIKEY as string,
//                 'Content-Type': 'application/json'
//             };
//             const apiResponse = await axios.post(
//                 process.env.AWS_SEND_EMAIL_API_URL as string,
//                 data,
//                 { headers }
//             );
//             console.log(apiResponse.data);
//             res.status(201).json({
//                 success: true,
//                 message: `Please check your email: ${user?.email} to activate your account`,
//                 activationToken: activationToken
//             });
//         } catch (error: any) {
//             console.log(error);
//             return next(new ErrorHandler(error.message, 400));
//         }
//     }
// );

export const verifyUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activationToken, activationCode } = req.body;
        const newUser: { user: IUser; activationCode: string } = jwt.verify(activationToken, process.env.ACTIVATION_SECRET as string) as { user: IUser; activationCode: string };
        if (newUser.activationCode !== activationCode) {
            return next(new ErrorHandler('Invalid Activation code', 400));
        }
        const { firstName, lastName, email, role, password } = newUser.user;
        const existUser = await UserModel.asyncFindOne({ email });
        if (existUser) {
            return next(new ErrorHandler("email already exist", 400));
        }
        const user = await UserModel.asyncCreateDoc({
            firstName,
            lastName,
            email,
            role,
            password
        });

        res.status(201).json({
            success: true,
            message: "User created successfully"
        });
    } catch (error: any) {
        console.log(error);
        return next(new ErrorHandler(error.message, 400));
    }
});

// login user
interface ILoginRequest {
    email: string;
    password: string;
}
export const loginUser = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body as ILoginRequest;
            if (!email || !password) {
                res.status(400).json({
                    status: false,
                    message: 'please enter email and password'
                });
            }
            const user: IUser = await UserModel.asyncFindOne({ email }, { password: 1, email: 1, firstName: 1, role: 1 });
            console.log(`user: ${user}`);
            if (!user) {
                res.status(400).json({
                    status: false,
                    message: 'Invalid email or password'
                });
            }
            const isPassword = await user.comparePassword(password);
            if (!isPassword) {
                res.status(400).json({
                    status: false,
                    message: 'Invalid email or password'
                });
            }
            sendToken(user, 200, res);
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

export const logoutUser = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.cookie('access_token', "", { maxAge: 1 });
            res.cookie('refresh_token', '', { maxAge: 1 });
            const userId = req.user?._id || '';
            // redis.del(userId);
            res.status(200).json({
                success: true,
                message: "logout successfully"
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400))
        }
    }
);

interface IActivationToken {
    token: string;
    activationCode: string;
}
export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jwt.sign({ user, activationCode }, process.env.ACTIVATION_SECRET as Secret, { expiresIn: "5m" });
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
            res.cookie('access_token', new_access_token, accessTokenOptions);
            res.cookie('refresh_token', new_refresh_token, refreshTokenOptions);
            return next();
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

// microsoft AD Sign-In step1
export const getAzureSSOUrl = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authConfig = {
                issuer: process.env.AD_ISSUER,
                authUrl: process.env.AD_AUTHURL,
                clientId: process.env.AD_CLIENTID,
                tenantId: process.env.AD_TENANTID,
                clientSecret: process.env.AD_CLIENTSECRET,
                responseType: "id_token+token",
                responseMode: "fragment",
                redirectUri: process.env.AD_REDIRECT_URI,
                scope: "openid https://graph.micorsoft.com/User.read"
            };
            let ssourl = encodeURI(
                `${authConfig.authUrl}client_id=${authConfig.clientId}&response_type=${authConfig.responseType}
                &redirect_uri=${authConfig.redirectUri}&scope=${authConfig.scope}&response_mode=${authConfig.responseMode}
                &state=${Date.now()}}&nonce=${Date.now()}`
            );
            res.status(200).json(ssourl)
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

export const validateAzureAuth = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader?.split(' ')[1];
            const decodedData = jwt.decode(token as string, { complete: true });
            console.log(decodedData);
            const payload: any = decodedData?.payload;
            const userDoc = await UserModel.asyncFindOne({ email: payload?.unique_name }, { name: 1, role: 1, status: 1, email: 1 });
            if (userDoc != null) {
                if (userDoc.status === 'inactive') {
                    return next(new ErrorHandler('User account is inactive. Kindly contact admin...', 403));
                }
                else {
                    sendToken(userDoc, 200, res);
                }
            }
            else {
                const user = {
                    name: payload?.given_name || '',
                    email: payload?.unique_name || '',
                    role: 'user',
                    password: 'asd123',
                    status: 'confirmed',
                    force_reset_password: false,
                    force_reset_password_expiration: new Date()
                };
                const createUser = await UserModel.asyncCreate(user, global.db);
                sendToken(createUser, 200, res);
            }
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);



