
import crypto from "crypto";
import { pool } from "../../db/pool.js";
import { extractText } from "./extraction.service.js";
import { chunkText } from "./chunking.service.js";
import { embedChunks } from "./embeddings.service.js";
import { findDocumentByHash, insertDocument } from "../../db/queries/documents.queries.js";
import { insertChunks } from "../../db/queries/chunks.queries.js";
import HTTPError from "../../utils/HTTPError.js";

const hashBuffer = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");

export const ingestDocument = async ({ workspaceId, file }) => {
    const fileHash = hashBuffer(file.buffer);

    // idempotency check -- happens before any expensive work (extraction/embedding)
    const existing = await findDocumentByHash(workspaceId, fileHash);
    if (existing) {
        return {
            status: "already_exists",
            document: existing,
        };
    }

    const text = await extractText(file.buffer, file.mimetype);
    if (!text || !text.trim()) {
        throw new HTTPError(422, "No extractable text found in this document");
    }

    const chunks = chunkText(text);
    if (chunks.length === 0) {
        throw new HTTPError(422, "Document produced no usable chunks");
    }

    const embeddings = await embedChunks(chunks);

    // single transaction: document row + all chunk rows succeed or fail together
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const document = await insertDocument(client, {
            workspaceId,
            filename: file.originalname,
            fileHash,
        });

        await insertChunks(client, {
            workspaceId,
            documentId: document.id,
            chunks,
            embeddings,
        });

        await client.query("COMMIT");

        return {
            status: "ingested",
            document,
            chunkCount: chunks.length,
        };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};