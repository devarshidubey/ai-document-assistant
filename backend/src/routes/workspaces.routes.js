import express from "express";
import { listWorkspaces, createWorkspaceHandler } from "../controllers/workspaces.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// mounted at /workspaces
router.use(requireAuth);

router.get("/", listWorkspaces);
router.post("/", createWorkspaceHandler);

export default router;