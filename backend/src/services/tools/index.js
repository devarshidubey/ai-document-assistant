import { saveTaskTool } from "./saveTask.tool.js";
import { sendDiscordSummaryTool } from "./sendDiscordSummary.tool.js";

export const toolRegistry = {
    [saveTaskTool.name]: saveTaskTool,
    [sendDiscordSummaryTool.name]: sendDiscordSummaryTool,
};

export const allTools = Object.values(toolRegistry);

export const getTool = (name) => toolRegistry[name] || null;