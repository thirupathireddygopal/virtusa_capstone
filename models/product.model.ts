import mongoose, { Schema, model, Document, Model } from "mongoose";
import { Collections } from "../constants/collectionName.constant";

const colName = Collections.ProductColName;
export interface IProduct extends Document {
  productId: string;
  name: string;
  price: number;
  description?: string;
  stock: number;
}

const ProductSchema = new Schema<IProduct>(
  {
    productId: {
      type: String,
      unique: true,
      required: [true, 'Please provide course id']
    },
    name: { type: String, unique: true, required: true },
    price: { type: Number, required: true },
    description: String,
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// export const Product = model<IProduct>("Product", ProductSchema);
const ProductModel: Model<IProduct> = mongoose.model(colName, ProductSchema, colName);
export default ProductModel;

// promises or async/await for a cleaner and more type-safe approach
export async function asyncCreateDoc(data: any): Promise<any> {
  const db = global.db;
  const productModel = db.model(colName, ProductSchema, colName);
  try {
    const result = await productModel.create(data);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function asyncCreate(data: any): Promise<any> {
  const db = global.db;
  const productModel = db.model(colName, ProductSchema, colName);
  try {
    const result = await productModel.create(data);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function asyncFind(condition: any, projection?: any): Promise<any> {
  const db = global.db;
  const productModel = db.model(colName, ProductSchema, colName);
  try {
    const result = await productModel.find(condition, projection).exec();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function asyncFindById(condition: any): Promise<any> {
  const db = global.db;
  const productModel = db.model(colName, ProductSchema, colName);
  try {
    const result = await productModel.findById(condition).exec();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function asyncFindOne(condition: any, projection?: any): Promise<any> {
  const db = global.db;
  const productModel = db.model(colName, ProductSchema, colName);
  try {
    const result = await productModel.findOne(condition, projection).exec();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function asyncCountDocuments(condition: any, db: mongoose.Connection): Promise<any> {
  const productModel = db.model(colName, ProductSchema, colName);
  try {
    const result = await productModel.countDocuments(condition).exec();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function asyncUpdateOne(condition: any, update?: any): Promise<any> {
  const db = global.db;
  const productModel = db.model(colName, ProductSchema, colName);
  try {
    const result = await productModel.updateOne(condition, update).exec();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function asyncAggregate(condition: any): Promise<any> {
  const db = global.db;
  const productModel = db.model(colName, ProductSchema, colName);
  try {
    const result = await productModel.aggregate(condition).exec();
    return result;
  } catch (error) {
    throw error;
  }
}

