import { NextFunction, Request, Response } from "express";
import * as ProductModel from "../models/product.model";
import { catchAsyncError } from "../middlewares/catchAsyncError";
import { ErrorHandler } from "../utils/errorHandler";
import { randomBytes } from "crypto";
import * as UserModel from "../models/user.model";

// export const createProduct = async (req: Request, res: Response) => {
//   const product = await Product.create(req.body);
//   res.status(201).json(product);
// };

// export const getProducts = async (_: Request, res: Response) => {
//   const products = await Product.find();
//   res.json(products);
// };

export const createProduct = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isEligible = await UserModel.asyncFindOne({ _id: req.user?._id, role: "admin" }, {});
    if (!isEligible) {
      return next(new ErrorHandler('user not eligible for creating product', 400));
    }
    const isProductExist = await ProductModel.asyncFindOne({ name: req.body.name }, {});
    if (isProductExist) {
      return next(new ErrorHandler('product already exist', 400));
    }
    const productId = randomBytes(6).toString('hex'); // we can make use of hex or base64
    req.body.productId = productId;
    const productDoc = await ProductModel.asyncCreate(req.body);
    console.log(productDoc);
    const userDocUp = await UserModel.asyncUpdateOne(
      { _id: req.user?._id },
      {
        $push: { products: productDoc._id }
      });
    console.log(userDocUp);
    res.status(201).json({
      success: true,
      message: 'Product created successfully'
    });
  } catch (error: any) {
    console.log(error);
    return next(new ErrorHandler(error.message, 400));
  }
});

export const getProducts = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await ProductModel.asyncFind({}, { _id: 0 });
    console.log(products);
    res.status(201).json({
      success: true,
      data: products
    })
  } catch (error: any) {
    console.log(error);
    res.status(400).json(error);
  }
});