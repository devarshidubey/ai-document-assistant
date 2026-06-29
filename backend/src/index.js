import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db/pool.js";
import authRoutes from "./routes/auth.routes.js";
import documentRoutes from "./routes/documents.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import workspaceRoutes from "./routes/workspaces.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import errorHandler from "./middleware/errorHandler.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ ok: true, service: "workspace-rag-backend" });
});

app.get("/health/db", async (req, res) => {
    try {
        const result = await pool.query("select 1 as ok");
        res.json({ ok: true, db: result.rows[0] });
    } catch (err) {
        console.error("DB health check failed:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

app.use("/auth", authRoutes);
app.use("/workspaces", workspaceRoutes);
app.use("/workspaces/:workspaceId/documents", documentRoutes);
app.use("/workspaces/:workspaceId/chat", chatRoutes);
app.use("/workspaces/:workspaceId/dashboard", dashboardRoutes);

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Invalid URL",
        data: null,
    });
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});