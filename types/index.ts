import { ObjectId } from "mongodb";

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