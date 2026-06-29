import { pool } from "../pool.js";

export const listToolCallsForWorkspace = async (workspaceId) => {
    const result = await pool.query(
        `select id, message_id, tool_name, arguments, result, status, error_message, created_at
        from tool_calls
        where workspace_id = $1
        order by created_at desc`,
        [workspaceId]
    );
    return result.rows;
};