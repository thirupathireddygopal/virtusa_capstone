import { Router } from "express";
import { isAuthenticated } from "../middlewares/authMiddleware";
import { createUser, loginUser } from "../controllers/user.controller";

const router = Router();

router.post('/createUser', createUser);
router.post('/loginUser', loginUser);

export default router;