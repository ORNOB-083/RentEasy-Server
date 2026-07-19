import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as commentController from "./comment.controller";

const router = Router();

router.get("/user/me", authMiddleware, commentController.getMyComments);
router.get("/property/:propertyId", commentController.getCommentsByProperty);
router.post("/", authMiddleware, commentController.createComment);
router.patch("/:id", authMiddleware, commentController.updateComment);
router.delete("/:id", authMiddleware, commentController.deleteComment);

export default router;