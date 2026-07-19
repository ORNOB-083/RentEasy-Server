import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import * as commentService from "./comment.service";

export const createComment = asyncHandler(async (req: Request, res: Response) => {
    const { propertyId, text } = req.body;

    if (!propertyId || !text?.trim()) {
        return sendError(res, "Property ID and comment text are required", 400);
    }

    const result = await commentService.createComment({
        propertyId,
        userId: req.user!.id,
        userName: req.user!.name || "Anonymous",
        userImage: req.user!.image as string | undefined,
        text: text.trim(),
    });

    if (result === "INVALID_PROPERTY") return sendError(res, "Invalid property ID", 400);
    if (result === "PROPERTY_NOT_FOUND") return sendError(res, "Property not found", 404);

    return sendSuccess(res, "Comment posted successfully", result, 201);
});

export const getCommentsByProperty = asyncHandler(async (req: Request, res: Response) => {
    const comments = await commentService.getCommentsByProperty(req.params.propertyId as string);
    return sendSuccess(res, "Comments fetched successfully", comments);
});

export const getMyComments = asyncHandler(async (req: Request, res: Response) => {
    const comments = await commentService.getCommentsByUser(req.user!.id);
    return sendSuccess(res, "Your comments fetched successfully", comments);
});

export const updateComment = asyncHandler(async (req: Request, res: Response) => {
    const { text } = req.body;

    if (!text?.trim()) {
        return sendError(res, "Comment text is required", 400);
    }

    const result = await commentService.updateComment(req.params.id as string, req.user!.id, text.trim());

    if (result === null) return sendError(res, "Comment not found", 404);
    if (result === "FORBIDDEN") return sendError(res, "You can only edit your own comments", 403);

    return sendSuccess(res, "Comment updated successfully", result);
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const isAdmin = req.user!.role === "admin";
    const result = await commentService.deleteComment(req.params.id as string, req.user!.id, isAdmin);

    if (result === null) return sendError(res, "Comment not found", 404);
    if (result === "FORBIDDEN") return sendError(res, "You can only delete your own comments", 403);

    return sendSuccess(res, "Comment deleted successfully");
});