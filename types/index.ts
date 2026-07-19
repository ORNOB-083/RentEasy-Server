import { ObjectId } from "mongodb";
export type BookingStatus = "pending" | "accepted" | "rejected";

export type PropertyType =
    | "Apartment"
    | "Studio"
    | "Family Flat"
    | "Bachelor Room"
    | "Sublet"
    | "Commercial";

export type VerificationStatus = "pending" | "approved" | "rejected";

export interface Property {
    _id?: ObjectId;
    title: string;
    shortDescription: string;
    fullDescription: string;
    price: number;
    location: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    propertyType: PropertyType;
    bedrooms: number;
    bathrooms: number;
    furnishingStatus: "Furnished" | "Semi-Furnished" | "Unfurnished";
    amenities: string[];
    images: string[]; // 1–5 imgbb URLs
    posterId: string; // Better Auth user id
    posterName: string;
    posterEmail: string;
    posterPhone: string;
    status: VerificationStatus;
    isAdvertised: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Booking {
    _id?: ObjectId;
    propertyId: string;
    propertyTitle: string;
    requesterId: string;
    requesterName: string;
    requesterEmail: string;
    ownerId: string;
    phone: string;
    whatsapp?: string;
    facebook?: string;
    message?: string;
    status: BookingStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface Notification {
    _id?: ObjectId;
    recipientId: string;
    type: "new_booking" | "booking_accepted" | "booking_rejected";
    relatedBookingId?: ObjectId;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

export interface SavedProperty {
    _id?: ObjectId;
    userId: string;
    propertyId: string;
    createdAt: Date;
}

export interface Comment {
    _id?: ObjectId;
    propertyId: string;
    userId: string;
    userName: string;
    userImage?: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}