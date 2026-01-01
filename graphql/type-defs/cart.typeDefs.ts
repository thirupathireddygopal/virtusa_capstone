import gql from "graphql-tag";

export const cartTypeDefs = gql`
   type CartItem{
    productId:Product!
    quantity:Int!
   }

   type Cart{
    _id:ID!
    items:[CartItem!]!
   }

    # cart:CartItem!
   type CartResponse{
    success:Boolean!
    message:String
   }

   extend type Query{
    getMyCart:Cart
   }

   extend type Mutation{
    addToCart(
        productId:String!
        quantity:Int!
    ):CartResponse


   }
`