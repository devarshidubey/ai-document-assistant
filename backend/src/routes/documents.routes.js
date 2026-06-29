import express from "express";
import { uploadDocument } from "../controllers/documents.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireWorkspaceOwnership } from "../middleware/workspace.middleware.js";
import { uploadSingleDocument } from "../middleware/upload.middleware.js";

const router = express.Router({ mergeParams: true });

router.use(requireAuth, requireWorkspaceOwnership);

// mounted at /workspaces/:workspaceId/documents
router.post('/', uploadSingleDocument, uploadDocument);
//router.get('/', login);

export default router;