import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
// import { initializeDefaultAppSettings } from '../../models/defaultSetting.model';

interface mongoOptions {
    authSource?: string;
}

let initialized = false;

function initialize(database: string, host: string, callback: (err?: Error) => void): void {
    console.log('intialization: ', initialized);
    if (initialized) {
        callback();
    }
    initialized = true;
    openMongo(callback, host);
};


function openMongo(callback: (err?: Error) => void, host: string): void {
    let url = `mongodb://${process.env.DB_Address}:${process.env.DB_PORT}/${process.env.DB}`;
    let options: mongoOptions = {}
    if (process.env.ENV === 'production' || process.env.ENV === 'pre-prod') {
        url = `mongodb://${process.env.DB_USER}:${encodeURIComponent(`${process.env.DB_PASS}`)}@${process.env.DB_Address}:${process.env.DB_PORT}/${process.env.DB}`;
        options.authSource = 'admin'
    }
    mongoose.connect(url, options)
        .then(async () => {
            console.log('MongoDB connected successfully...');
            const mongooseConnection = mongoose.connection;
            mongooseConnection.on('error', console.error.bind(console, 'MongoDB connection error'));
            global.db = mongooseConnection;
            global.masterdb = mongooseConnection;
            global.clients = {};
            global.clientdbconn = {};
            // await initializeDefaultAppSettings(global.db, false);
            callback();
        }).catch((err) => {
            console.error('MongoDB connection error: ', err);
            callback(err);
        })
}

export { openMongo, initialize };