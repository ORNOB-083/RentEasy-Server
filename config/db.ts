import { MongoClient, Db } from "mongodb";
import { env } from "./env";

const client = new MongoClient(env.mongoUri);
let db: Db;

export const connectDB = async (): Promise<void> => {
    try {
        await client.connect();
        db = client.db("RentEasy");
        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    }
};

export const getDB = (): Db => {
    if (!db) {
        throw new Error("Database not initialized. Call connectDB() first.");
    }
    return db;
};

export const closeDB = async (): Promise<void> => {
    await client.close();
    console.log("MongoDB connection closed");
};