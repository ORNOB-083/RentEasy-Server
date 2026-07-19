import { ObjectId } from "mongodb";
import { getDB } from "../../config/db";
import { AppUser } from "../../types";

const USERS_COLLECTION = "user"; // Better Auth's default collection name
const getUsersCollection = () => getDB().collection<AppUser>(USERS_COLLECTION);
const getPropertiesCollection = () => getDB().collection("properties");

export const getAllUsers = async () => {
    return getUsersCollection()
        .find({}, { projection: { emailVerified: 0 } })
        .sort({ createdAt: -1 })
        .toArray();
};

export const updateUserRole = async (id: string, role: "user" | "admin") => {
    if (!ObjectId.isValid(id)) return null;

    await getUsersCollection().updateOne(
        { _id: new ObjectId(id) },
        { $set: { role } }
    );

    return getUsersCollection().findOne({ _id: new ObjectId(id) });
};

export const markUserAsFraud = async (id: string) => {
    if (!ObjectId.isValid(id)) return null;

    const user = await getUsersCollection().findOne({ _id: new ObjectId(id) });
    if (!user) return null;

    await getUsersCollection().updateOne(
        { _id: new ObjectId(id) },
        { $set: { isFraud: true } }
    );

    // Hide all of this user's properties from public listings
    await getPropertiesCollection().updateMany(
        { posterId: id },
        { $set: { status: "rejected" } }
    );

    return getUsersCollection().findOne({ _id: new ObjectId(id) });
};

export const unmarkUserAsFraud = async (id: string) => {
    if (!ObjectId.isValid(id)) return null;

    await getUsersCollection().updateOne(
        { _id: new ObjectId(id) },
        { $set: { isFraud: false } }
    );

    return getUsersCollection().findOne({ _id: new ObjectId(id) });
};

export const getDashboardStats = async () => {
    const [totalUsers, totalProperties, pendingProperties, totalBookings] = await Promise.all([
        getUsersCollection().countDocuments({}),
        getPropertiesCollection().countDocuments({}),
        getPropertiesCollection().countDocuments({ status: "pending" }),
        getDB().collection("bookings").countDocuments({}),
    ]);

    return { totalUsers, totalProperties, pendingProperties, totalBookings };
};