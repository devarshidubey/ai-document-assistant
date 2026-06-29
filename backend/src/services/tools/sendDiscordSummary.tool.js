
export const sendDiscordSummaryTool = {
    name: "send_discord_summary",
    description:
        "Posts a short summary message to the workspace's Discord channel. Use this when the user explicitly asks to notify, post, send, or share a summary to Discord/the team/the channel.",
    parameters: {
        type: "object",
        properties: {
            summary: {
                type: "string",
                description: "The summary text to post, plain language, no markdown required.",
            },
        },
        required: ["summary"],
        additionalProperties: false,
    },

    // discordWebhookUrl comes from server-side env config via injected context,
    // never from the model or the client -- never exposed in any response.
    execute: async (args, { discordWebhookUrl }) => {
        if (!discordWebhookUrl) {
            return { posted: false, error: "No Discord webhook configured for this deployment." };
        }

        const response = await fetch(discordWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: args.summary }),
        });

        if (!response.ok) {
            // don't leak response body (could echo back the webhook URL on some errors)
            return { posted: false, error: `Discord returned status ${response.status}` };
        }

        return { posted: true };
    },
};