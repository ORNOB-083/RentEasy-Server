import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["MONGODB_URI"] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: process.env.PORT || 8000,
  mongoUri: process.env.MONGODB_URI as string,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV || "development",
};