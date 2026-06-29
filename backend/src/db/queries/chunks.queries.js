import { pool } from "../pool.js";

export const insertChunks = async (client, { workspaceId, documentId, chunks, embeddings }) => {
    const insertPromises = chunks.map((chunkTextValue, i) => {
        const embeddingLiteral = `[${embeddings[i].join(",")}]`;
        return client.query(
            `insert into chunks (workspace_id, document_id, chunk_text, chunk_index, embedding)
            values ($1, $2, $3, $4, $5)`,
            [workspaceId, documentId, chunkTextValue, i, embeddingLiteral]
        );
    });
    await Promise.all(insertPromises);
};

/**
 * THE isolation-critical query. workspace_id filter is INSIDE the SQL,
 * applied before/alongside the vector distance ordering -- never fetch
 * broadly and filter in application code.
 *
 * Uses cosine distance (<=>) since embeddings are compared via vector_cosine_ops.
 * Lower distance = more similar. We also return the distance so the caller
 * can apply a "no good match" threshold for honest "I don't know" answers.
 */
export const searchChunksInWorkspace = async (workspaceId, queryEmbedding, limit = 5) => {
    const embeddingLiteral = `[${queryEmbedding.join(",")}]`;

    const result = await pool.query(
        `select
        c.id as chunk_id,
        c.chunk_text,
        c.chunk_index,
        c.document_id,
        d.filename,
        c.embedding <=> $1 as distance
        from chunks c
        join documents d on d.id = c.document_id
        where c.workspace_id = $2
        order by c.embedding <=> $1
        limit $3`,
        [embeddingLiteral, workspaceId, limit]
    );

    return result.rows;
};