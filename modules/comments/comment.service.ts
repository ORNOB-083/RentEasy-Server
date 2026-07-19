import { ObjectId } from "mongodb";
import { getDB } from "../../config/db";
import { Comment } from "../../types";

const COLLECTION = "comments";
const getCollection = () => getDB().collection<Comment>(COLLECTION);

export const createComment = async (data: {
    propertyId: string;
    userId: string;
    userName: string;
    userImage?: string;
    text: string;
}) => {
    if (!ObjectId.isValid(data.propertyId)) return "INVALID_PROPERTY";

    const propertiesCollection = getDB().collection("properties");
    const property = await propertiesCollection.findOne({ _id: new ObjectId(data.propertyId) });
    if (!property) return "PROPERTY_NOT_FOUND";

    const comment: Comment = {
        propertyId: data.propertyId,
        userId: data.userId,
        userName: data.userName,
        userImage: data.userImage,
        text: data.text,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const result = await getCollection().insertOne(comment);
    return { ...comment, _id: result.insertedId };
};

export const getCommentsByProperty = async (propertyId: string) => {
    return getCollection()
        .find({ propertyId })
        .sort({ createdAt: -1 })
        .toArray();
};

export const getCommentsByUser = async (userId: string) => {
    return getCollection()
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();
};

export const updateComment = async (
    id: string,
    userId: string,
    text: string
) => {
    if (!ObjectId.isValid(id)) return null;

    const comment = await getCollection().findOne({ _id: new ObjectId(id) });
    if (!comment) return null;
    if (comment.userId !== userId) return "FORBIDDEN";

    await getCollection().updateOne(
        { _id: new ObjectId(id) },
        { $set: { text, updatedAt: new Date() } }
    );

    return getCollection().findOne({ _id: new ObjectId(id) });
};

export const deleteComment = async (id: string, userId: string, isAdmin: boolean) => {
    if (!ObjectId.isValid(id)) return null;

    const comment = await getCollection().findOne({ _id: new ObjectId(id) });
    if (!comment) return null;
    if (comment.userId !== userId && !isAdmin) return "FORBIDDEN";

    await getCollection().deleteOne({ _id: new ObjectId(id) });
    return true;
};