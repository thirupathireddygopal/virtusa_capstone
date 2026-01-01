import gql from "graphql-tag";

export const userTypeDefs = gql`
  type User{
    _id:ID!
    firstName:String
    lastName:String
    email:String!
    role:String!
  }

  type AuthUser{
    _id:ID!
    firstName:String
    lastName:String
    email:String!
    role:String!
  }

  type RegisterResponse {
    success: Boolean!
    user: AuthUser!
    message: String
  }

  type AuthResponse {
    success: Boolean!
    user: AuthUser
    access_token: String
    refresh_token: String
    message: String
  }

  type SuccessResponse {
    success: Boolean!
    message: String
  }

 # extend type Query{
 # First definition --> type Query {}
   type Query{
    me: User
    getUserById:User
  }
  
  # extend type Mutation{
  # First definition --> type Mutation {}
   type Mutation{
    registerUser(
        firstName:String!
        lastName:String!
        email:String!
        password:String!
        role:String!
    ): RegisterResponse
    
    loginUser(
        email:String!
        password:String!
    ): AuthResponse
 }    
`;