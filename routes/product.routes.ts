import { Router } from "express";
import { createProduct, getProducts } from "../controllers/product.controller";
import { isAuthenticated } from "../middlewares/authMiddleware";

const router = Router();

router.post("/create", isAuthenticated, createProduct);
router.get("/", getProducts);

export default router;
