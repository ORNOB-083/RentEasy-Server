import express, { Application, Request, Response } from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import propertyRoutes from "./modules/properties/property.route";
import bookingRoutes from "./modules/bookings/booking.route";
import notificationRoutes from "./modules/notifications/notification.route";

const app: Application = express();

// Core middlewares
app.use(
    cors({
        origin: env.clientUrl,
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "RentEasy BD server is running",
    });
});

// Feature routes will be mounted here as we build them, e.g.:
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
// app.use("/api/comments", commentRoutes);
// app.use("/api/saved", savedRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/ai", aiRoutes);

// 404 handler — must come after all real routes
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
    });
});

// Global error handler — must be last
app.use(errorMiddleware);

export default app;