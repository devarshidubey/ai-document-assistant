
import { listDocumentsForWorkspace } from "../db/queries/documents.queries.js";
import { listMessagesForWorkspace } from "../db/queries/messages.queries.js";
import { listToolCallsForWorkspace } from "../db/queries/tools.queries.js";
import { listTasksForWorkspace } from "../db/queries/tasks.queries.js";

export const getDocuments = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;
        const documents = await listDocumentsForWorkspace(workspaceId);
        res.json({ documents });
    } catch (err) {
        next(err);
    }
};

export const getChatHistory = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;
        const messages = await listMessagesForWorkspace(workspaceId);
        res.json({ messages });
    } catch (err) {
        next(err);
    }
};

export const getToolCallLog = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;
        const toolCalls = await listToolCallsForWorkspace(workspaceId);
        res.json({ toolCalls });
    } catch (err) {
        next(err);
    }
};

export const getTasks = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;
        const tasks = await listTasksForWorkspace(workspaceId);
        res.json({ tasks });
    } catch (err) {
        next(err);
    }
};


/**
 * Convenience bundle endpoint -- returns everything the dashboard needs
 * in one request, scoped to the active workspace. Optional: the frontend
 * could instead call the three endpoints above separately if it prefers
 * to load/refresh them independently.
 */
export const getDashboardSummary = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;

        const [documents, messages, toolCalls, tasks] = await Promise.all([
            listDocumentsForWorkspace(workspaceId),
            listMessagesForWorkspace(workspaceId),
            listToolCallsForWorkspace(workspaceId),
            listTasksForWorkspace(workspaceId)
        ]);

        res.json({
            workspace: req.workspace, // attached by requireWorkspaceOwnership middleware
            documents,
            messages,
            toolCalls,
            tasks
        });
    } catch (err) {
        next(err);
    }
};