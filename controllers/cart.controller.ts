import { Request, Response } from "express";
import { Cart } from "../models/cart.model";

export const addToCart = async (req: Request, res: Response) => {
  const { productId, quantity = 1 } = req.body;
  console.log(req.user?._id);
  const cart = await Cart.findOne({ userId: req.user?._id });

  if (!cart) {
    const newCart = await Cart.create({
      userId: req.user?._id,
      items: [{ productId, quantity }],
    });
    return res.status(201).json(newCart);
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  await cart.save();
  res.json(cart);
};

export const getUserCart = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const cart = await Cart.findOne({ userId }).populate("items.productId");
  res.json(cart);
};
