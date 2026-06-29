import { pool } from "../pool.js";

export const listMessagesForWorkspace = async (workspaceId) => {
    const result = await pool.query(
        `select id, role, content, citations, created_at
        from messages
        where workspace_id = $1
        order by created_at asc`,
        [workspaceId]
    );
    return result.rows;
};