import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import * as savedService from "./saved.service";

export const saveProperty = asyncHandler(async (req: Request, res: Response) => {
    const { propertyId } = req.body;

    if (!propertyId) {
        return sendError(res, "Property ID is required", 400);
    }

    const result = await savedService.saveProperty(req.user!.id, propertyId);

    if (result === "INVALID_PROPERTY") return sendError(res, "Invalid property ID", 400);
    if (result === "PROPERTY_NOT_FOUND") return sendError(res, "Property not found", 404);
    if (result === "ALREADY_SAVED") return sendError(res, "Property already saved", 400);

    return sendSuccess(res, "Property saved successfully", result, 201);
});

export const unsaveProperty = asyncHandler(async (req: Request, res: Response) => {
    const removed = await savedService.unsaveProperty(req.user!.id, req.params.propertyId as string);

    if (!removed) return sendError(res, "Saved property not found", 404);

    return sendSuccess(res, "Property removed from saved list");
});

export const getSavedProperties = asyncHandler(async (req: Request, res: Response) => {
    const properties = await savedService.getSavedProperties(req.user!.id);
    return sendSuccess(res, "Saved properties fetched successfully", properties);
});

export const getSavedPropertyIds = asyncHandler(async (req: Request, res: Response) => {
    const ids = await savedService.getSavedPropertyIds(req.user!.id);
    return sendSuccess(res, "Saved property IDs fetched successfully", ids);
});