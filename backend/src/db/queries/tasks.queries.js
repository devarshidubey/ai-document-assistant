import { pool } from "../pool.js";

export const listTasksForWorkspace = async (workspaceId) => {
    const result = await pool.query(
        `select id, title, created_at
        from tasks
        where workspace_id = $1
        order by created_at desc`,
        [workspaceId]
    );
    return result.rows;
};