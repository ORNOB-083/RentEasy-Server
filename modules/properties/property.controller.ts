import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import * as propertyService from "./property.service";

export const createProperty = asyncHandler(async (req: Request, res: Response) => {
    const { title, shortDescription, fullDescription, price, location, propertyType,
        bedrooms, bathrooms, furnishingStatus, amenities, images } = req.body;

    if (!title || !shortDescription || !fullDescription || !price || !location || !propertyType) {
        return sendError(res, "Missing required property fields", 400);
    }

    if (!Array.isArray(images) || images.length < 1 || images.length > 5) {
        return sendError(res, "Please provide between 1 and 5 images", 400);
    }

    const property = await propertyService.createProperty({
        title,
        shortDescription,
        fullDescription,
        price: Number(price),
        location,
        propertyType,
        bedrooms: Number(bedrooms) || 0,
        bathrooms: Number(bathrooms) || 0,
        furnishingStatus,
        amenities: amenities || [],
        images,
        posterId: req.user!.id,
        posterName: req.user!.name || "",
        posterEmail: req.user!.email,
        posterPhone: (req.user!.phone as string) || "",
    });

    return sendSuccess(res, "Property submitted for review", property, 201);
});

export const getProperties = asyncHandler(async (req: Request, res: Response) => {
    const { search, propertyType, minPrice, maxPrice, bedrooms, furnishingStatus, sortBy, page, limit } = req.query;

    const result = await propertyService.getProperties({
        search: search as string,
        propertyType: propertyType as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        furnishingStatus: furnishingStatus as string,
        sortBy: sortBy as "price_asc" | "price_desc" | "newest",
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 8,
    });

    return sendSuccess(res, "Properties fetched successfully", result);
});

export const getPropertyById = asyncHandler(async (req: Request, res: Response) => {
    const property = await propertyService.getPropertyById(req.params.id as string);

    if (!property) {
        return sendError(res, "Property not found", 404);
    }

    return sendSuccess(res, "Property fetched successfully", property);
});

export const getMyProperties = asyncHandler(async (req: Request, res: Response) => {
    const properties = await propertyService.getPropertiesByUser(req.user!.id);
    return sendSuccess(res, "Your properties fetched successfully", properties);
});

export const getAdvertisedProperties = asyncHandler(async (req: Request, res: Response) => {
    const properties = await propertyService.getAdvertisedProperties();
    return sendSuccess(res, "Advertised properties fetched successfully", properties);
});

export const getLatestProperties = asyncHandler(async (req: Request, res: Response) => {
    const properties = await propertyService.getLatestProperties();
    return sendSuccess(res, "Latest properties fetched successfully", properties);
});

export const updateProperty = asyncHandler(async (req: Request, res: Response) => {
    const result = await propertyService.updateProperty(req.params.id as string, req.user!.id, req.body);

    if (result === null) return sendError(res, "Property not found", 404);
    if (result === "FORBIDDEN") return sendError(res, "You can only update your own properties", 403);

    return sendSuccess(res, "Property updated successfully", result);
});

export const deleteProperty = asyncHandler(async (req: Request, res: Response) => {
    const result = await propertyService.deleteProperty(req.params.id as string, req.user!.id);

    if (result === null) return sendError(res, "Property not found", 404);
    if (result === "FORBIDDEN") return sendError(res, "You can only delete your own properties", 403);

    return sendSuccess(res, "Property deleted successfully");
});

// --- Admin-only ---

export const getAllPropertiesForAdmin = asyncHandler(async (req: Request, res: Response) => {
    const properties = await propertyService.getAllPropertiesForAdmin();
    return sendSuccess(res, "All properties fetched successfully", properties);
});

export const approveProperty = asyncHandler(async (req: Request, res: Response) => {
    const property = await propertyService.setVerificationStatus(req.params.id as string, "approved");
    if (!property) return sendError(res, "Property not found", 404);
    return sendSuccess(res, "Property approved successfully", property);
});

export const rejectProperty = asyncHandler(async (req: Request, res: Response) => {
    const property = await propertyService.setVerificationStatus(req.params.id as string, "rejected");
    if (!property) return sendError(res, "Property not found", 404);
    return sendSuccess(res, "Property rejected successfully", property);
});

export const toggleAdvertise = asyncHandler(async (req: Request, res: Response) => {
    const result = await propertyService.toggleAdvertise(req.params.id as string);

    if (result === null) return sendError(res, "Property not found", 404);
    if (result === "LIMIT_REACHED") return sendError(res, "Maximum 6 properties can be advertised at a time", 400);

    return sendSuccess(res, "Advertise status updated successfully", result);
});