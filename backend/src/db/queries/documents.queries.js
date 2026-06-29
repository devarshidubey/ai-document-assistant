import { pool } from "../pool.js";

export const findDocumentByHash = async (workspaceId, fileHash) => {
    const result = await pool.query(
        `select id, filename, uploaded_at
        from documents
        where workspace_id = $1 and file_hash = $2`,
        [workspaceId, fileHash]
    );
    return result.rows[0] || null;
};

export const insertDocument = async (client, { workspaceId, filename, fileHash }) => {
    const result = await client.query(
        `insert into documents (workspace_id, filename, file_hash)
        values ($1, $2, $3)
        returning id, filename, uploaded_at`,
        [workspaceId, filename, fileHash]
    );
    return result.rows[0];
};

export const listDocumentsForWorkspace = async (workspaceId) => {
    const result = await pool.query(
        `select id, filename, uploaded_at
        from documents
        where workspace_id = $1
        order by uploaded_at desc`,
        [workspaceId]
    );
    return result.rows;
};