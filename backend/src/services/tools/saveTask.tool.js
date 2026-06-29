import { pool } from "../../db/pool.js";

export const saveTaskTool = {
    name: "save_task",
    description:
        "Saves a task to the current workspace's task list. Use this when the user explicitly asks to save, create, add, or remember a task or to-do item.",
    parameters: {
        type: "object",
        properties: {
            title: {
                type: "string",
                description: "The task title or description, concise and actionable.",
            },
        },
        required: ["title"],
        additionalProperties: false,
    },

    // workspaceId is injected by the tool-calling loop, NEVER taken from
    // the model's arguments -- the model only ever supplies `title`.
    execute: async (args, { workspaceId }) => {
        const result = await pool.query(
            `insert into tasks (workspace_id, title)
            values ($1, $2)
            returning id, title, created_at`,
            [workspaceId, args.title]
        );
        return { saved: true, task: result.rows[0] };
    },
};