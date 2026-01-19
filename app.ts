import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import logger from 'morgan';
import path from 'path';

import { redis } from "./utils/database/redis";

import router from "./routes";

// GraphQL imports
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";

import { typeDefs } from "./graphql/type-defs";
import { resolvers } from './graphql/resolvers';
import { createContext } from "./graphql/context";

export const app = express();

app.use(logger('dev'));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: "500mb", extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req: Request, res: Response, next: NextFunction) => {
    const corsOptions: CorsOptions = {
        credentials: true,
        origin: async function (origin, callback) {
            console.log('origin: ', origin);
            const corsUrls: string[] = process.env.CORS_URLS ? JSON.parse(process.env.CORS_URLS) : [];

            const value = await redis.get('lms_cors_urls');
            const redis_cors_urls: any[] = value ? JSON.parse(value as string) : [];
            console.log('cors urls...', redis_cors_urls);

            const headers = req.headers; // Access the headers
            console.log('Received headers: ', headers); // Log the headers if needed

            // ['https:' , '' , 'xyz.thiru.com']
            const referer = req.headers.referer?.split('/')[2];
            console.log('referer...', referer);
            if (!origin || redis_cors_urls.includes(referer) || corsUrls.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    }
    // cors(corsOptions);
    cors(corsOptions)(req, res, next);
});

// # here we are disabling REST API way
// app.use('/api/v1', router);

async function startGraphQL() {
    const server = new ApolloServer({
        typeDefs: typeDefs,
        resolvers: resolvers
    });

    await server.start();

    app.use('/graphql', expressMiddleware(server,
        { context: async ({ req }) => createContext({ req }) }
    ));

}
startGraphQL();





