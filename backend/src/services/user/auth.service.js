import { findUserByEmail, createUserRecord } from "../../db/queries/users.queries.js";
import HTTPError from "../../utils/HTTPError.js";
import { hashPassword, verifyPassword } from "../../utils/hash.js";

export const createUser = async ({ email, password })=> {
    const existing = await findUserByEmail(email);
    if (existing) {
        throw new HTTPError(409, "User with this email already exists");
    }

    const passwordHash = await hashPassword(password);
    const newUser = await createUserRecord({ email, passwordHash });
    return newUser; // { id, email, created_at } -- no password hash leaks out
}

export const authenticateUser = async ({ email, password }) => {
    const user = await findUserByEmail(email);
    if (!user) throw new HTTPError(401, "Invalid credentials");

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) throw new HTTPError(401, "Invalid credentials");

    // strip the hash before returning the user object further up the stack
    const { password_hash, ...safeUser } = user;
    return safeUser;
};
