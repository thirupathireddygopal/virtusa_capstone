import dotenv from 'dotenv';
dotenv.config();

import { Redis } from 'ioredis';

const redis_port = parseInt(process.env.REDIS_PORT as string);
console.log(typeof redis_port, redis_port);

// port: 6379, process.env.REDIS_PORT
export const redis = new Redis({
    host: process.env.REDIS_HOST as string,
    port: redis_port,
    password: process.env.REDIS_PASSWORD as string
});

// writing the logs related to connect, close, error
redis.on('connect', async () => {
    console.log('Connected to redis successfully...');
    // const value = await redis.get('lms_cors_urls');
    // console.log('retrived values: ', value, typeof value);
});

redis.on('ready', ()=>{
    console.log('Redis connection is ready to user..');
});

redis.on('error', (error)=>{
    console.log('Redis connection error:');
    console.error(error);
});

// redis.on('reconnecting', (times: any)=>{
//     console.log(`Reconnecting to redis ${times} attempts`);
// });

// redis.on('close', ()=>{
//     console.log('Redis connection closed.')
// });