import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as notificationController from "./notification.controller";

const router = Router();

router.get("/", authMiddleware, notificationController.getMyNotifications);
router.patch("/:id/read", authMiddleware, notificationController.markAsRead);
router.patch("/read-all", authMiddleware, notificationController.markAllAsRead);

export default router;