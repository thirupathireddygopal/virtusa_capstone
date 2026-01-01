import * as UserModel from "../../models/user.model";
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { redis } from "../../utils/database/redis";

export const userResolvers = {
    Query: {
        me: async (_: any, __: any, context: any) => {
            return context.user || null;
        },
        getUserById: async (_: any, { id }: any) => {
            const user = await UserModel.asyncFindById({ id });
            return user;
        },
    },
    Mutation: {
        /**
        mutation RegisterUser($firstName: String!, $lastName: String!, $email: String!, $password: String!, $role: String!) {
            registerUser(firstName: $firstName, lastName: $lastName, email: $email, password: $password, role: $role) {
                success
                user {
                _id
                firstName
                role
                email
                }
                message
            }
        }
         */
        registerUser: async (_: any, args: any) => {
            const existUser = await UserModel.asyncFindOne({ email: args.email });
            if (existUser) throw new Error("Email already exists");
            const userDoc = await UserModel.asyncCreateDoc(args);
            /* 🚫 Remove password before returning */
            const safeUser = {
                _id: userDoc._id,
                firstName: userDoc.firstName,
                lastName: userDoc.lastName,
                email: userDoc.email,
                role: userDoc.role,
            };
            return {
                success: true,
                message: "User created successfully",
                user: safeUser
            };
        },
        /**
            mutation LoginUser($email: String!, $password: String!) {
                loginUser(email: $email, password: $password) {
                    user {
                    email
                    firstName
                    lastName
                    role
                    _id
                    }
                    access_token
                    refresh_token
                    success
                }
            }
         */
        loginUser: async (_: any, { email, password }: any) => {
            const user = await UserModel.asyncFindOne(
                { email },
                { password: 1, email: 1, firstName: 1, role: 1 }
            );
            if (!user || !(await user.comparePassword(password))) {
                throw new Error("Invalid email or password");
            }
            /* 🔐 Generate Tokens, { expiresIn: "5m" } */
            const access_token = jwt.sign(
                { id: user._id },
                process.env.JWT_ACCESS_TOKEN as string,
                { expiresIn: "7d" }
            );

            const refresh_token = jwt.sign(
                { id: user._id },
                process.env.JWT_REFRESH_TOKEN as string,
                { expiresIn: "7d" }
            );
            /* 💾 Store session in Redis */
            await redis.set(user._id.toString(), JSON.stringify(user));

            /* 🚫 Remove password before returning */
            const safeUser = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            };

            return {
                success: true,
                message: "Login successful",
                user: safeUser,
                access_token,
                refresh_token,
            };
        }
        
    }
};