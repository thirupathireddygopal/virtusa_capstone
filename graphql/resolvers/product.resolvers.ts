import { randomBytes } from 'crypto';
import * as ProductModel from '../../models/product.model';
import * as UserModel from '../../models/user.model';
export const productResolvers = {
    Query: {
        getProducts: async () => {
            const products = await ProductModel.asyncFind({}, { _id: 0 });
            return { success: true, data: products };
        }
    },
    Mutation: {
        /**
         * 
         * @param _ 
         * @param args 
         * @param context 
         * @returns 
         mutation CreateProduct($name: String!, $price: Float!, $stock: Int!) {
            createProduct(name: $name, price: $price, stock: $stock) {
                success
                product {
                productId
                price
                name
                stock
                description
                }
            }
            }
         */
        createProduct: async (_: any, args: any, context: any) => {
            if (!context.user) throw new Error("Unauthorized");
            if (context.user.role !== "admin") {
                throw new Error("Only admin can create product");
            }
            const exists = await ProductModel.asyncFindOne({ name: args.name });
            if (exists) throw new Error("Product already exists");

            const productDoc = await ProductModel.asyncCreate({
                ...args,
                productId: randomBytes(6).toString("hex"),
            });
            console.log(productDoc);
            const userDocUp = await UserModel.asyncUpdateOne(
                { _id: context.user?._id },
                {
                    $push: { products: productDoc._id }
                });
            console.log(userDocUp);

            return {
                success: true,
                product: productDoc,
                message: "Product created successfully",
            };
        },
    }
}
