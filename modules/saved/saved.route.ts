import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as savedController from "./saved.controller";

const router = Router();

router.get("/ids", authMiddleware, savedController.getSavedPropertyIds);
router.get("/", authMiddleware, savedController.getSavedProperties);
router.post("/", authMiddleware, savedController.saveProperty);
router.delete("/:propertyId", authMiddleware, savedController.unsaveProperty);

export default router;