import { ObjectId } from "mongodb";
import { getDB } from "../../config/db";
import { Property } from "../../types";

const COLLECTION = "properties";

const getCollection = () => getDB().collection<Property>(COLLECTION);

interface GetPropertiesFilters {
    search?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    furnishingStatus?: string;
    sortBy?: "price_asc" | "price_desc" | "newest";
    page?: number;
    limit?: number;
}

export const createProperty = async (data: Omit<Property, "_id" | "createdAt" | "updatedAt" | "status" | "isAdvertised">) => {
    const property: Property = {
        ...data,
        status: "pending",
        isAdvertised: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const result = await getCollection().insertOne(property);
    return { ...property, _id: result.insertedId };
};

export const getProperties = async (filters: GetPropertiesFilters) => {
    const {
        search,
        propertyType,
        minPrice,
        maxPrice,
        bedrooms,
        furnishingStatus,
        sortBy = "newest",
        page = 1,
        limit = 8,
    } = filters;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { status: "approved" };

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
        ];
    }
    if (propertyType) query.propertyType = propertyType;
    if (furnishingStatus) query.furnishingStatus = furnishingStatus;
    if (bedrooms) query.bedrooms = Number(bedrooms);
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOption: Record<string, 1 | -1> =
        sortBy === "price_asc"
            ? { price: 1 }
            : sortBy === "price_desc"
                ? { price: -1 }
                : { createdAt: -1 };

    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
        getCollection().find(query).sort(sortOption).skip(skip).limit(limit).toArray(),
        getCollection().countDocuments(query),
    ]);

    return {
        properties,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getPropertyById = async (id: string) => {
    if (!ObjectId.isValid(id)) return null;
    return getCollection().findOne({ _id: new ObjectId(id) });
};

export const getPropertiesByUser = async (posterId: string) => {
    return getCollection().find({ posterId }).sort({ createdAt: -1 }).toArray();
};

export const getAdvertisedProperties = async () => {
    return getCollection()
        .find({ isAdvertised: true, status: "approved" })
        .limit(6)
        .toArray();
};

export const getLatestProperties = async () => {
    return getCollection()
        .find({ status: "approved" })
        .sort({ createdAt: -1 })
        .limit(8)
        .toArray();
};

export const updateProperty = async (
    id: string,
    posterId: string,
    updates: Partial<Property>
) => {
    if (!ObjectId.isValid(id)) return null;

    const property = await getCollection().findOne({ _id: new ObjectId(id) });
    if (!property) return null;
    if (property.posterId !== posterId) return "FORBIDDEN";

    // Prevent clients from directly overwriting protected fields
    delete updates.status;
    delete updates.isAdvertised;
    delete updates.posterId;
    delete updates._id;

    await getCollection().updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updates, updatedAt: new Date() } }
    );

    return getCollection().findOne({ _id: new ObjectId(id) });
};

export const deleteProperty = async (id: string, posterId: string) => {
    if (!ObjectId.isValid(id)) return null;

    const property = await getCollection().findOne({ _id: new ObjectId(id) });
    if (!property) return null;
    if (property.posterId !== posterId) return "FORBIDDEN";

    await getCollection().deleteOne({ _id: new ObjectId(id) });
    return true;
};

// --- Admin-only operations ---

export const setVerificationStatus = async (
    id: string,
    status: "approved" | "rejected"
) => {
    if (!ObjectId.isValid(id)) return null;

    await getCollection().updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } }
    );

    return getCollection().findOne({ _id: new ObjectId(id) });
};

export const toggleAdvertise = async (id: string) => {
    if (!ObjectId.isValid(id)) return null;

    const property = await getCollection().findOne({ _id: new ObjectId(id) });
    if (!property) return null;

    if (!property.isAdvertised) {
        const advertisedCount = await getCollection().countDocuments({ isAdvertised: true });
        if (advertisedCount >= 6) {
            return "LIMIT_REACHED";
        }
    }

    await getCollection().updateOne(
        { _id: new ObjectId(id) },
        { $set: { isAdvertised: !property.isAdvertised, updatedAt: new Date() } }
    );

    return getCollection().findOne({ _id: new ObjectId(id) });
};

export const getAllPropertiesForAdmin = async () => {
    return getCollection().find({}).sort({ createdAt: -1 }).toArray();
};