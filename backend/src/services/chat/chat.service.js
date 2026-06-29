
import { retrieveContext } from "./retrieval.service.js";
import {
  runChatTurn,
  continueWithFunctionResult,
  runFinalStreamingTurn,
} from "./llm.service.js";
import { getTool } from "../tools/index.js";
import { validateArgs } from "../../utils/validateArgs.js";
import { pool } from "../../db/pool.js";

const MAX_TOOL_ITERATIONS = 4;

const logToolCall = async ({ workspaceId, messageId, toolName, args, result, status, errorMessage }) => {
  await pool.query(
    `insert into tool_calls (workspace_id, message_id, tool_name, arguments, result, status, error_message)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [workspaceId, messageId, toolName, JSON.stringify(args ?? {}), JSON.stringify(result ?? {}), status, errorMessage ?? null]
  );
};

const saveMessage = async ({ workspaceId, role, content, citations }) => {
  const result = await pool.query(
    `insert into messages (workspace_id, role, content, citations)
     values ($1, $2, $3, $4)
     returning id`,
    [workspaceId, role, content, citations ? JSON.stringify(citations) : null]
  );
  return result.rows[0].id;
};

export const updateMessage = async (messageId, { content, citations }) => {
  await pool.query(
    `update messages set content = $1, citations = $2 where id = $3`,
    [content, citations ? JSON.stringify(citations) : null, messageId]
  );
};

const extractFunctionCall = (response) => {
  const calls = response.functionCalls;
  if (calls && calls.length > 0) return calls[0];
  return null;
};

const handleToolCall = async (functionCall, { workspaceId, messageId }) => {
  const tool = getTool(functionCall.name);

  if (!tool) {
    const errorResult = { error: `Unknown tool: "${functionCall.name}"` };
    await logToolCall({
      workspaceId, messageId, toolName: functionCall.name,
      args: functionCall.args, result: errorResult,
      status: "error", errorMessage: errorResult.error,
    });
    return { name: functionCall.name, response: errorResult, id: functionCall.id };
  }

  const validation = validateArgs(functionCall.args, tool.parameters);
  if (!validation.valid) {
    const errorResult = { error: "Invalid arguments", details: validation.errors };
    await logToolCall({
      workspaceId, messageId, toolName: tool.name,
      args: functionCall.args, result: errorResult,
      status: "error", errorMessage: validation.errors.join("; "),
    });
    return { name: tool.name, response: errorResult, id: functionCall.id };
  }

  try {
    const result = await tool.execute(functionCall.args, {
      workspaceId,
      discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
    });
    await logToolCall({
      workspaceId, messageId, toolName: tool.name,
      args: functionCall.args, result, status: "success",
    });
    return { name: tool.name, response: result, id: functionCall.id };
  } catch (err) {
    const errorResult = { error: "Tool execution failed" };
    await logToolCall({
      workspaceId, messageId, toolName: tool.name,
      args: functionCall.args, result: errorResult,
      status: "error", errorMessage: err.message,
    });
    return { name: tool.name, response: errorResult, id: functionCall.id };
  }
};

/**
 * Streaming version of the chat orchestration.
 *
 * onToken(text) is called for every incremental chunk of the FINAL answer.
 * Tool-call turns happen invisibly first (non-streaming, structured) --
 * nothing is streamed until we know for certain the model has finished
 * calling tools and is producing its final prose answer.
 */
export const handleChatMessageStreaming = async (workspaceId, question, onToken) => {
  await saveMessage({ workspaceId, role: "user", content: question });

  const { chunks, hasRelevantContext } = await retrieveContext(workspaceId, question);

  const assistantMessageId = await saveMessage({
    workspaceId,
    role: "assistant",
    content: "(thinking...)",
    citations: null,
  });

  let response, contents;
  try {
    // --- Phase 1: resolve any tool calls, non-streaming ---
    const turn = await runChatTurn(question, chunks);
    response = turn.response;
    contents = turn.contents;

    let iterations = 0;
    let functionCall = extractFunctionCall(response);

    while (functionCall && iterations < MAX_TOOL_ITERATIONS) {
      iterations += 1;

      const functionResponsePart = await handleToolCall(functionCall, {
        workspaceId,
        messageId: assistantMessageId,
      });

      const modelContent = response.candidates[0].content;

      const next = await continueWithFunctionResult(
        contents,
        modelContent,
        { functionResponse: functionResponsePart }
      );

      response = next.response;
      contents = next.contents;
      functionCall = extractFunctionCall(response);
    }

    // --- Phase 2: no more tool calls pending. Re-issue this turn as a
    // stream, purely to get token-by-token output for the client.
    const stream = await runFinalStreamingTurn(contents);

    let finalText = "";
    for await (const chunk of stream) {
      const tokenText = chunk.text || "";
      if (tokenText) {
        finalText += tokenText;
        onToken(tokenText);
      }
    }

    if (!finalText.trim()) {
      finalText = "I wasn't able to generate a response.";
    }

    const citations = chunks.map((c) => ({
      documentId: c.document_id,
      filename: c.filename,
      chunkIndex: c.chunk_index,
    }));
    const finalCitations = hasRelevantContext ? citations : [];

    await updateMessage(assistantMessageId, { content: finalText, citations: finalCitations });

    return { answer: finalText, citations: finalCitations, groundedInDocuments: hasRelevantContext };
  } catch (err) {
    await updateMessage(assistantMessageId, {
      content: "Sorry, something went wrong generating a response. Please try asking again.",
      citations: [],
    });
    throw err;
  }
};