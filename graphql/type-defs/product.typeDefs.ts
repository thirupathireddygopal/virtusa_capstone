import gql from "graphql-tag";
export const ProductTypeDefs = gql`
    type Product{
        productId:String!
        name:String!
        price:Float!
        description:String!
        stock:Int!
        createdAt:String
    }

    type ProductResponse{
        success:Boolean!
        product:Product!
        message:String
    }

    type getProductResponse{
        success:Boolean
        data:[Product!]
    }

    extend type Query{
        getProducts: getProductResponse
    }

    extend type Mutation{
        createProduct(
            name:String!
            price:Float!
            description:String
            stock:Int!
        ): ProductResponse
    }
`;