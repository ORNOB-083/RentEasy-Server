import { ObjectId } from "mongodb";
import { getDB } from "../../config/db";
import { Notification } from "../../types";

const COLLECTION = "notifications";
const getCollection = () => getDB().collection<Notification>(COLLECTION);

export const createNotification = async (data: {
    recipientId: string;
    type: Notification["type"];
    relatedBookingId?: ObjectId;
    message: string;
}) => {
    const notification: Notification = {
        ...data,
        isRead: false,
        createdAt: new Date(),
    };

    const result = await getCollection().insertOne(notification);
    return { ...notification, _id: result.insertedId };
};

export const getNotificationsByUser = async (recipientId: string) => {
    return getCollection()
        .find({ recipientId })
        .sort({ createdAt: -1 })
        .limit(30)
        .toArray();
};

export const getUnreadCount = async (recipientId: string) => {
    return getCollection().countDocuments({ recipientId, isRead: false });
};

export const markAsRead = async (id: string, recipientId: string) => {
    if (!ObjectId.isValid(id)) return null;

    const notification = await getCollection().findOne({ _id: new ObjectId(id) });
    if (!notification) return null;
    if (notification.recipientId !== recipientId) return "FORBIDDEN";

    await getCollection().updateOne(
        { _id: new ObjectId(id) },
        { $set: { isRead: true } }
    );

    return getCollection().findOne({ _id: new ObjectId(id) });
};

export const markAllAsRead = async (recipientId: string) => {
    await getCollection().updateMany(
        { recipientId, isRead: false },
        { $set: { isRead: true } }
    );
    return true;
};