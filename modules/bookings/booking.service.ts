import { ObjectId } from "mongodb";
import { getDB } from "../../config/db";
import { Booking } from "../../types";

const COLLECTION = "bookings";
const getCollection = () => getDB().collection<Booking>(COLLECTION);

export const createBooking = async (data: {
    propertyId: string;
    requesterId: string;
    requesterName: string;
    requesterEmail: string;
    phone: string;
    whatsapp?: string;
    facebook?: string;
    message?: string;
}) => {
    const propertiesCollection = getDB().collection("properties");
    const property = await propertiesCollection.findOne({ _id: new ObjectId(data.propertyId) });

    if (!property) return "PROPERTY_NOT_FOUND";
    if (property.posterId === data.requesterId) return "OWN_PROPERTY";

    const booking: Booking = {
        propertyId: data.propertyId,
        propertyTitle: property.title,
        requesterId: data.requesterId,
        requesterName: data.requesterName,
        requesterEmail: data.requesterEmail,
        ownerId: property.posterId,
        phone: data.phone,
        whatsapp: data.whatsapp,
        facebook: data.facebook,
        message: data.message,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const result = await getCollection().insertOne(booking);

    // Create a notification for the property owner
    await getDB().collection("notifications").insertOne({
        recipientId: property.posterId,
        type: "new_booking",
        relatedBookingId: result.insertedId,
        message: `${data.requesterName} requested to book your property: ${property.title}`,
        isRead: false,
        createdAt: new Date(),
    });

    return { ...booking, _id: result.insertedId };
};

export const getBookingsByRequester = async (requesterId: string) => {
    return getCollection().find({ requesterId }).sort({ createdAt: -1 }).toArray();
};

export const getBookingsByOwner = async (ownerId: string) => {
    return getCollection().find({ ownerId }).sort({ createdAt: -1 }).toArray();
};

export const updateBookingStatus = async (
    id: string,
    ownerId: string,
    status: "accepted" | "rejected"
) => {
    if (!ObjectId.isValid(id)) return null;

    const booking = await getCollection().findOne({ _id: new ObjectId(id) });
    if (!booking) return null;
    if (booking.ownerId !== ownerId) return "FORBIDDEN";

    await getCollection().updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } }
    );

    return getCollection().findOne({ _id: new ObjectId(id) });
};

export const cancelBooking = async (id: string, requesterId: string) => {
    if (!ObjectId.isValid(id)) return null;

    const booking = await getCollection().findOne({ _id: new ObjectId(id) });
    if (!booking) return null;
    if (booking.requesterId !== requesterId) return "FORBIDDEN";
    if (booking.status !== "pending") return "ALREADY_PROCESSED";

    await getCollection().deleteOne({ _id: new ObjectId(id) });
    return true;
};