import { Schema, model, Document, Types } from "mongoose";
import { Collections } from "../constants/collectionName.constant";

interface ICartItem {
  productId: Types.ObjectId;
  quantity: number;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
}

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: Collections.UserColName, unique: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: Collections.ProductColName },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

export const Cart = model<ICart>("Cart", CartSchema);
