import express from "express";
import { postChatMessage } from "../controllers/chat.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireWorkspaceOwnership } from "../middleware/workspace.middleware.js";

const router = express.Router({ mergeParams: true });

// mounted at /workspaces/:workspaceId/chat
router.use(requireAuth, requireWorkspaceOwnership);

router.post("/", postChatMessage);

export default router;