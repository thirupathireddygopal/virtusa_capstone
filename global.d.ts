import { Connection } from 'mongoose';

declare global {
    var db: Connection;
    var masterdb: Connection;
    var clients: Record<string, any>;
    var clientdbconn: Record<string, any>;
}

export {};