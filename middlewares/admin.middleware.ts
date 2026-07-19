import { Request, Response, NextFunction } from "express";
import "../types/express";

export const adminMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Forbidden: Admin access required",
        });
    }
    next();
};