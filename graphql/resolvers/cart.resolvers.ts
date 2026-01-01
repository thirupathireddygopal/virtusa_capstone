import { Cart } from "../../models/cart.model";

export const cartResolvers = {
  Query: {
    /**
     * @param _ 
     * @param __ 
     * @param context 
     * @returns 
     * query GetMyCart {
        getMyCart {
          items {
            productId {
              name
              price
              productId
              stock
            }
          }
        }
      }
     */
    getMyCart: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error("Unauthorized");

      return Cart.findOne({ userId: context.user._id })
        .populate("items.productId");
    },
  },

  Mutation: {
    addToCart: async (_: any, { productId, quantity = 1 }: any, context: any) => {
      if (!context.user) throw new Error("Unauthorized");

      const cart = await Cart.findOne({ userId: context.user._id });

      if (!cart) {
        return Cart.create({
          userId: context.user._id,
          items: [{ productId, quantity }],
        });
      }

      const index = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (index > -1) {
        cart.items[index].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }

      const cartDoc = await cart.save();
      console.log("card doc ..........");
      console.log(cartDoc);
      return {
        success: true,
        // cart: cartDoc,
        message: "cart item added"
      };
    },
  },
};
