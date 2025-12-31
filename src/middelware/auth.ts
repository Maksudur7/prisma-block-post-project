import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";

export enum UserRole {
    ADMIN = "admin",
    USER = "user"
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                roles: string;
                emailVerified: boolean;
            }
        }
    }
}

const Mauth = (...roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // get user session
        const session = await auth.api.getSession({
            headers: req.headers as any
        })
        if (!session) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }

        if (!session.user.emailVerified) {
            return res.status(403).json({ success: false, message: "Please verify your email to proceed." })
        }
        req.user = {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.name || "",
            roles: session.user.role || "",
            emailVerified: session.user.emailVerified || false,
        }
        if (roles.length && !roles.includes(req.user.roles as UserRole)) {
            return res.status(403).json({ success: false, message: "Forbidden" })
        }

        next();
        console.log(session);
    }
}

export default Mauth;