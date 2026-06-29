
import { handleChatMessageStreaming } from "../services/chat/chat.service.js";
import HTTPError from "../utils/HTTPError.js";

const writeSseEvent = (res, data) => {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

export const postChatMessage = async (req, res, next) => {
  const { workspaceId } = req.params;
  const { question } = req.body;

  if (!question || typeof question !== "string" || !question.trim()) {
    return next(new HTTPError(400, "question is required and must be a non-empty string"));
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const result = await handleChatMessageStreaming(workspaceId, question.trim(), (token) => {
      writeSseEvent(res, { type: "token", token });
    });

    writeSseEvent(res, {
      type: "done",
      citations: result.citations,
      groundedInDocuments: result.groundedInDocuments,
    });
    res.end();
  } catch (err) {
    // headers are already sent (streaming response), so we cannot use the
    // normal next(err) -> errorHandler JSON-response path here. Send a
    // terminal SSE error event instead, then close the connection.
    console.error("Chat streaming error:", err);
    writeSseEvent(res, { type: "error", message: "Something went wrong generating a response." });
    res.end();
  }
};