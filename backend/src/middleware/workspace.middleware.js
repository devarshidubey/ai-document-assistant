import { findOwnedWorkspace } from "../db/queries/workspaces.queries.js";
import HTTPError from "../utils/HTTPError.js";

/**
 * Must run AFTER requireAuth (depends on req.user.id being set).
 * Verifies the :workspaceId route param belongs to the authenticated user,
 * and attaches the verified workspace to req.workspace for downstream use.
 */
export const requireWorkspaceOwnership = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;

        if (!workspaceId) {
        throw new HTTPError(400, "workspaceId is required");
        }
        if (!req.user || !req.user.id) {
        // requireAuth should have already caught this -- defensive guard only
            throw new HTTPError(401, "Authentication required");
        }

        const workspace = await findOwnedWorkspace(workspaceId, req.user.id);

        if (!workspace) {
        // intentionally 404, not 403 -- avoids confirming the workspace
        // exists at all to a caller who doesn't own it
            throw new HTTPError(404, "Workspace not found");
        }

        req.workspace = workspace;
        next();
    } catch (err) {
        next(err);
    }
};