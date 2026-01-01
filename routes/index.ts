import { Router } from "express";
import defaultRoutes from './default.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';

const router = Router();

router.use('', defaultRoutes);
router.use('/product', productRoutes);
router.use('/cart', cartRoutes);

export default router;