import { pool } from "../pool.js";

export const findUserByEmail = async (email) => {
    const result = await pool.query(
        "select id, email, password_hash, created_at from users where email = $1",
        [email]
    );
    return result.rows[0] || null;
};

export const createUserRecord = async ({ email, passwordHash }) => {
    const result = await pool.query(
        `insert into users (email, password_hash)
        values ($1, $2)
        returning id, email, created_at`,
        [email, passwordHash]
    );
    return result.rows[0];
};