import { DecodedUser } from "../utils/jwt";

declare global {
    namespace Express {
        interface Request {
            user?: DecodedUser;
        }
    }
}

export { };