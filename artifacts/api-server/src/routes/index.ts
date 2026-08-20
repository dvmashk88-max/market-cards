import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storefrontRouter from "./storefront";
import ordersRouter from "./orders";
import storefrontTrustRouter from "./storefront-trust";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storefrontRouter);
router.use(ordersRouter);
router.use(storefrontTrustRouter);

export default router;
