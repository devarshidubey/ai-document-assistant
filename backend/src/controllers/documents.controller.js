
import { ingestDocument } from "../services/document/injestion.service.js";
import { listDocumentsForWorkspace } from "../db/queries/documents.queries.js";
import HTTPError from "../utils/HTTPError.js";

export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) throw new HTTPError(400, "No file provided");

        const { workspaceId } = req.params; // assumes route is /workspaces/:workspaceId/documents

        const result = await ingestDocument({ workspaceId, file: req.file });

        const statusCode = result.status === "already_exists" ? 200 : 201;
        res.status(statusCode).json(result);
    } catch (err) {
        next(err);
    }
};

export const listDocuments = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;
        const documents = await listDocumentsForWorkspace(workspaceId);
        res.json({ documents });
    } catch (err) {
        next(err);
    }
};