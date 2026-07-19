import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.middleware";
import * as propertyController from "./property.controller";

const router = Router();

// Public — specific static routes first
router.get("/advertised", propertyController.getAdvertisedProperties);
router.get("/latest", propertyController.getLatestProperties);

// Protected — specific static routes before the dynamic :id route
router.get("/user/me", authMiddleware, propertyController.getMyProperties);

// Admin-only — also static, must come before :id
router.get("/admin/all", authMiddleware, adminMiddleware, propertyController.getAllPropertiesForAdmin);
router.patch("/admin/:id/approve", authMiddleware, adminMiddleware, propertyController.approveProperty);
router.patch("/admin/:id/reject", authMiddleware, adminMiddleware, propertyController.rejectProperty);
router.patch("/admin/:id/advertise", authMiddleware, adminMiddleware, propertyController.toggleAdvertise);

// Public listing + dynamic :id — must come last
router.get("/", propertyController.getProperties);
router.post("/", authMiddleware, propertyController.createProperty);
router.get("/:id", propertyController.getPropertyById);
router.patch("/:id", authMiddleware, propertyController.updateProperty);
router.delete("/:id", authMiddleware, propertyController.deleteProperty);

export default router;