import { embedText } from "../document/embeddings.service.js";
import { searchChunksInWorkspace } from "../../db/queries/chunks.queries.js";

// Cosine distance threshold: below this, a chunk is considered "relevant enough"
// to ground an answer. Above this, we treat it as noise -- contributes to honest
// "I don't know" instead of forcing the LLM to stretch irrelevant context into an answer.
const RELEVANCE_THRESHOLD = 0.5;
const TOP_K = 5;

export const retrieveContext = async (workspaceId, question) => {
    const queryEmbedding = await embedText(question);

    const rawResults = await searchChunksInWorkspace(workspaceId, queryEmbedding, TOP_K);

    const relevantChunks = rawResults.filter((row) => row.distance <= RELEVANCE_THRESHOLD);

    return {
        chunks: relevantChunks,
        hasRelevantContext: relevantChunks.length > 0,
    };
};