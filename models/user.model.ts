import mongoose, { Document, Model, Schema } from "mongoose";
import { Collections } from '../constants/collectionName.constant';

import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const colName = Collections.UserColName;
const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/


export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    avatar: {
        public_id: string; //cloudinary
        url: string;
    };
    role: string;
    status: string;
    isVerified: boolean;
    bulkUploaded: boolean; // user uploaded using excel form
    products: mongoose.Schema.Types.ObjectId[]; // List of orders
    orders: mongoose.Schema.Types.ObjectId[]; // List of orders
    comparePassword: (password: string) => Promise<boolean>;
    SignAccessToken: () => string;
    SignRefreshToken: () => string;
}

const UserSchema: Schema<IUser> = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'please enter your first Name']
        },
        lastName: {
            type: String,
            required: [true, 'please enter your last name']
        },
        email: {
            type: String,
            required: [true, 'please enter your email'],
            validate: {
                validator: function (value: string) {
                    return emailRegex.test(value);
                }
            },
            unique: true
        },
        password: {
            type: String,
            minlength: [6, "Password must be at least 6 characters length"],
            select: false
        },
        avatar: {
            public_id: String,
            url: String
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        bulkUploaded: {
            type: Boolean,
            default: false
        },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: Collections.ProductColName
            }
        ],
        orders: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: Collections.CartColName
            }
        ]
    },
    {
        timestamps: true
    }
);

// Hashing the password
UserSchema.pre<IUser>('save', async function () {
    if (!this.isModified('password')) {
         return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// sign Access token // when user login, create a access token
UserSchema.methods.SignAccessToken = function () {
    console.log('SignAccessToken: ', this._id);
    return jwt.sign({ id: this._id }, process.env.JWT_ACCESS_TOKEN || '', { expiresIn: "10m" }); // { expiresIn: "5m" }
}

// sign in refresh token
UserSchema.methods.SignRefreshToken = function () {
    console.log('SignRereshToken: ', this._id);
    return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_TOKEN || '', { expiresIn: "7d" })
}

// compare with hash password
UserSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    console.log('entered password: ' + enteredPassword);
    console.log('this password: ', this.password);
    return await bcrypt.compare(enteredPassword, this.password);
}

const UserModel: Model<IUser> = mongoose.model(colName, UserSchema, colName);
export default UserModel;

// promises or async/await for a cleaner and more type-safe approach
export async function asyncCreateDoc(data: any): Promise<any> {
    const db = global.db;
    const userModel = db.model(colName, UserSchema, colName);
    try {
        const result = await userModel.create(data);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function asyncCreate(data: any, db: mongoose.Connection): Promise<any> {
    const userModel = db.model(colName, UserSchema, colName);
    try {
        const result = await userModel.create(data);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function asyncFind(condition: any, projection?: any): Promise<any> {
    const db = global.db;
    const userModel = db.model(colName, UserSchema, colName);
    try {
        const result = await userModel.find(condition, projection).exec();
        return result;
    } catch (error) {
        throw error;
    }
}

export async function asyncFindById(condition: any): Promise<any> {
    const db = global.db;
    const userModel = db.model(colName, UserSchema, colName);
    try {
        const result = await userModel.findById(condition).exec();
        return result;
    } catch (error) {
        throw error;
    }
}

export async function asyncFindOne(condition: any, projection?: any): Promise<any> {
    const db = global.db;
    const userModel = db.model(colName, UserSchema, colName);
    try {
        const result = await userModel.findOne(condition, projection).exec();
        return result;
    } catch (error) {
        throw error;
    }
}

export async function asyncCountDocuments(condition: any, db: mongoose.Connection): Promise<any> {
    const userModel = db.model(colName, UserSchema, colName);
    try {
        const result = await userModel.countDocuments(condition).exec();
        return result;
    } catch (error) {
        throw error;
    }
}

export async function asyncUpdateOne(condition: any, update?: any): Promise<any> {
    const db = global.db;
    const userModel = db.model(colName, UserSchema, colName);
    try {
        const result = await userModel.updateOne(condition, update).exec();
        return result;
    } catch (error) {
        throw error;
    }
}

export async function asyncAggregate(condition: any): Promise<any> {
    const db = global.db;
    const userModel = db.model(colName, UserSchema, colName);
    try {
        const result = await userModel.aggregate(condition).exec();
        return result;
    } catch (error) {
        throw error;
    }
}
