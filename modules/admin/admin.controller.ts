import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import * as adminService from "./admin.service";

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await adminService.getAllUsers();
    return sendSuccess(res, "Users fetched successfully", users);
});

export const makeAdmin = asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.updateUserRole(req.params.id as string, "admin");
    if (!user) return sendError(res, "User not found", 404);
    return sendSuccess(res, "User promoted to admin", user);
});

export const makeVendor = asyncHandler(async (req: Request, res: Response) => {
    // "Vendor" maps to a regular "user" role in your no-vendor-role model —
    // this endpoint effectively demotes an admin back to a normal user.
    const user = await adminService.updateUserRole(req.params.id as string, "user");
    if (!user) return sendError(res, "User not found", 404);
    return sendSuccess(res, "User role updated to standard user", user);
});

export const markAsFraud = asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.markUserAsFraud(req.params.id as string);
    if (!user) return sendError(res, "User not found", 404);
    return sendSuccess(res, "User marked as fraud and listings hidden", user);
});

export const unmarkAsFraud = asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.unmarkUserAsFraud(req.params.id as string);
    if (!user) return sendError(res, "User not found", 404);
    return sendSuccess(res, "Fraud flag removed", user);
});

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await adminService.getDashboardStats();
    return sendSuccess(res, "Dashboard stats fetched successfully", stats);
});