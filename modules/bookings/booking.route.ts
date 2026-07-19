import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as bookingController from "./booking.controller";

const router = Router();

router.post("/", authMiddleware, bookingController.createBooking);
router.get("/user/me", authMiddleware, bookingController.getMyBookings);
router.get("/received", authMiddleware, bookingController.getReceivedBookings);
router.patch("/:id/accept", authMiddleware, bookingController.acceptBooking);
router.patch("/:id/reject", authMiddleware, bookingController.rejectBooking);
router.delete("/:id", authMiddleware, bookingController.cancelBooking);

export default router;