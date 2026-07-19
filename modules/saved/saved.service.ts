import { ObjectId } from "mongodb";
import { getDB } from "../../config/db";
import { SavedProperty } from "../../types";

const COLLECTION = "saved";
const getCollection = () => getDB().collection<SavedProperty>(COLLECTION);

export const saveProperty = async (userId: string, propertyId: string) => {
    if (!ObjectId.isValid(propertyId)) return "INVALID_PROPERTY";

    const propertiesCollection = getDB().collection("properties");
    const property = await propertiesCollection.findOne({ _id: new ObjectId(propertyId) });
    if (!property) return "PROPERTY_NOT_FOUND";

    const existing = await getCollection().findOne({ userId, propertyId });
    if (existing) return "ALREADY_SAVED";

    const saved: SavedProperty = {
        userId,
        propertyId,
        createdAt: new Date(),
    };

    const result = await getCollection().insertOne(saved);
    return { ...saved, _id: result.insertedId };
};

export const unsaveProperty = async (userId: string, propertyId: string) => {
    const result = await getCollection().deleteOne({ userId, propertyId });
    return result.deletedCount > 0;
};

export const getSavedProperties = async (userId: string) => {
    const savedEntries = await getCollection().find({ userId }).sort({ createdAt: -1 }).toArray();

    if (savedEntries.length === 0) return [];

    const propertyIds = savedEntries.map((entry) => new ObjectId(entry.propertyId));
    const propertiesCollection = getDB().collection("properties");

    const properties = await propertiesCollection
        .find({ _id: { $in: propertyIds } })
        .toArray();

    return properties;
};

export const getSavedPropertyIds = async (userId: string) => {
    const savedEntries = await getCollection().find({ userId }).toArray();
    return savedEntries.map((entry) => entry.propertyId);
};

export const isPropertySaved = async (userId: string, propertyId: string) => {
    const existing = await getCollection().findOne({ userId, propertyId });
    return !!existing;
};