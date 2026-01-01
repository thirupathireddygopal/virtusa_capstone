import { Router } from "express";
import { addToCart, getUserCart } from "../controllers/cart.controller";
import { isAuthenticated } from "../middlewares/authMiddleware";

const router = Router();

router.post("/add", isAuthenticated, addToCart);
router.get("/:userId", isAuthenticated, getUserCart);

export default router;
