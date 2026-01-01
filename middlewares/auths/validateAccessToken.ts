import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../../utils/database/redis";

export const validateAccessToken = async (accessToken?: string) => {
    if (!accessToken) return null;
    try {
        const decoded = jwt.decode(accessToken) as JwtPayload;
        
        if (!decoded || !decoded.id) return null;
        
        // token expired → let resolver fail
        if (decoded.exp && decoded.exp <= Date.now() / 1000) {
            return null;
        }

        // getting user info from redis
        const user = await redis.get(decoded.id);
        if (!user) return null;

        return JSON.parse(user); // IUser
    } catch {
        return null;
    }
};
