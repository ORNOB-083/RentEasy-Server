import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";
import * as adminController from "./admin.controller";

const router = Router();

router.use(authMiddleware, adminMiddleware); // every route below requires admin

router.get("/stats", adminController.getDashboardStats);
router.get("/users", adminController.getAllUsers);
router.patch("/users/:id/make-admin", adminController.makeAdmin);
router.patch("/users/:id/make-user", adminController.makeVendor);
router.patch("/users/:id/mark-fraud", adminController.markAsFraud);
router.patch("/users/:id/unmark-fraud", adminController.unmarkAsFraud);

export default router;