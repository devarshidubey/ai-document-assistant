import { listWorkspacesForUser, createWorkspace } from "../db/queries/workspaces.queries.js";
import HTTPError from "../utils/HTTPError.js";

export const listWorkspaces = async (req, res, next) => {
    try {
        const workspaces = await listWorkspacesForUser(req.user.id);
        res.json({ workspaces });
    } catch (err) {
        next(err);
    }
};

export const createWorkspaceHandler = async (req, res, next) => {
    try {
        const { name } = req.body;

        if (!name || typeof name !== "string" || !name.trim()) {
            throw new HTTPError(400, "name is required and must be a non-empty string");
        }

        const workspace = await createWorkspace(req.user.id, name.trim());
        res.status(201).json({ workspace });
    } catch (err) {
        next(err);
    }
};