import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import * as bookingService from "./booking.service";

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
    const { propertyId, phone, whatsapp, facebook, message } = req.body;

    if (!propertyId || !phone) {
        return sendError(res, "Property ID and phone number are required", 400);
    }

    const result = await bookingService.createBooking({
        propertyId,
        requesterId: req.user!.id,
        requesterName: req.user!.name || "",
        requesterEmail: req.user!.email,
        phone,
        whatsapp,
        facebook,
        message,
    });

    if (result === "PROPERTY_NOT_FOUND") return sendError(res, "Property not found", 404);
    if (result === "OWN_PROPERTY") return sendError(res, "You cannot book your own property", 400);

    return sendSuccess(res, "Booking request sent successfully", result, 201);
});

export const getMyBookings = asyncHandler(async (req: Request, res: Response) => {
    const bookings = await bookingService.getBookingsByRequester(req.user!.id);
    return sendSuccess(res, "Your bookings fetched successfully", bookings);
});

export const getReceivedBookings = asyncHandler(async (req: Request, res: Response) => {
    const bookings = await bookingService.getBookingsByOwner(req.user!.id);
    return sendSuccess(res, "Received bookings fetched successfully", bookings);
});

export const acceptBooking = asyncHandler(async (req: Request, res: Response) => {
    const result = await bookingService.updateBookingStatus(req.params.id as string, req.user!.id, "accepted");
    if (result === null) return sendError(res, "Booking not found", 404);
    if (result === "FORBIDDEN") return sendError(res, "Not authorized", 403);
    return sendSuccess(res, "Booking accepted", result);
});

export const rejectBooking = asyncHandler(async (req: Request, res: Response) => {
    const result = await bookingService.updateBookingStatus(req.params.id as string, req.user!.id, "rejected");
    if (result === null) return sendError(res, "Booking not found", 404);
    if (result === "FORBIDDEN") return sendError(res, "Not authorized", 403);
    return sendSuccess(res, "Booking rejected", result);
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
    const result = await bookingService.cancelBooking(req.params.id as string, req.user!.id);
    if (result === null) return sendError(res, "Booking not found", 404);
    if (result === "FORBIDDEN") return sendError(res, "Not authorized", 403);
    if (result === "ALREADY_PROCESSED") return sendError(res, "Cannot cancel a processed booking", 400);
    return sendSuccess(res, "Booking cancelled successfully");
});