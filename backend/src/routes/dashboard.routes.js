import express from "express";
import {
    getDocuments,
    getChatHistory,
    getToolCallLog,
    getDashboardSummary,
} from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireWorkspaceOwnership } from "../middleware/workspace.middleware.js";

const router = express.Router({ mergeParams: true });

// mounted at /workspaces/:workspaceId/dashboard
router.use(requireAuth, requireWorkspaceOwnership);

router.get("/", getDashboardSummary);
router.get("/documents", getDocuments);
router.get("/messages", getChatHistory);
router.get("/tool-calls", getToolCallLog);

export default router;