import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import * as notificationService from "./notification.service";

export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
    const [notifications, unreadCount] = await Promise.all([
        notificationService.getNotificationsByUser(req.user!.id),
        notificationService.getUnreadCount(req.user!.id),
    ]);

    return sendSuccess(res, "Notifications fetched successfully", { notifications, unreadCount });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationService.markAsRead(req.params.id as string, req.user!.id);

    if (result === null) return sendError(res, "Notification not found", 404);
    if (result === "FORBIDDEN") return sendError(res, "Not authorized", 403);

    return sendSuccess(res, "Notification marked as read", result);
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAllAsRead(req.user!.id);
    return sendSuccess(res, "All notifications marked as read");
});