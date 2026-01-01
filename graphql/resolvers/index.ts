import { userResolvers } from "./user.resolvers";
import { productResolvers } from "./product.resolvers";
import { cartResolvers } from "./cart.resolvers";

export const resolvers = {
    Query: {
        ...userResolvers.Query,
        ...productResolvers.Query,
        ...cartResolvers.Query,
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...productResolvers.Mutation,
        ...cartResolvers.Mutation,
    },
};