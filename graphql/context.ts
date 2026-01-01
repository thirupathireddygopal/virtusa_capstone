import { Request } from "express";
import { validateAccessToken } from "../middlewares/auths/validateAccessToken";
import { IUser } from "../models/user.model";

export interface GraphQLContext {
  user: IUser | null;
}

export const createContext = async ({ req, }: { req: Request; }): Promise<GraphQLContext> => {
  const accessToken = (req.headers["access_token"] as string) || req.headers.authorization?.split(" ")[1];
  const user = await validateAccessToken(accessToken);
  return { user };
};
