import { pool } from "../pool.js";

/**
 * Returns the workspace row only if it belongs to the given user.
 * Returns null if the workspace doesn't exist OR belongs to someone else --
 * deliberately indistinguishable, so we never leak "this workspace exists
 * but isn't yours" to an unauthorized caller.
 */
export const findOwnedWorkspace = async (workspaceId, userId) => {
    const result = await pool.query(
        `select id, user_id, name, created_at
        from workspaces
        where id = $1 and user_id = $2`,
        [workspaceId, userId]
    );
    return result.rows[0] || null;
};

export const listWorkspacesForUser = async (userId) => {
    const result = await pool.query(
        `select id, name, created_at
        from workspaces
        where user_id = $1
        order by created_at asc`,
        [userId]
    );
    return result.rows;
};

export const createWorkspace = async (userId, name) => {
    const result = await pool.query(
        `insert into workspaces (user_id, name)
        values ($1, $2)
        returning id, name, created_at`,
        [userId, name]
    );
    return result.rows[0];
};