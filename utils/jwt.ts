import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../config/env";

const JWKS = createRemoteJWKSet(
    new URL(`${env.clientUrl}/api/auth/jwks`)
);

export interface DecodedUser {
    id: string;
    email: string;
    name?: string;
    role?: string;
    [key: string]: unknown;
}

export const verifyToken = async (token: string): Promise<DecodedUser> => {
    const { payload } = await jwtVerify(token, JWKS);
    return payload as DecodedUser;
};