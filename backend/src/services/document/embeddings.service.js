import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set. Check your .env file.");
}

const genAI = new GoogleGenAI({});

const EMBEDDING_MODEL = "gemini-embedding-001"; // stable model name -- see note below
const OUTPUT_DIMENSIONALITY = 768; // pgvector hnsw index caps at 2000 dims
const BATCH_SIZE = 20; // chunks per API call -- well under per-request limits
const MAX_RETRIES = 5;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extracts a Google-suggested retry delay (in ms) from an error, if present.
 * The API sometimes tells us exactly how long to wait (e.g. "34.5s").
 */
const extractRetryDelayMs = (err) => {
  try {
    const parsed = typeof err.message === "string" ? JSON.parse(err.message) : err;
    const retryInfo = parsed?.error?.details?.find(
      (d) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
    );
    if (retryInfo?.retryDelay) {
      const seconds = parseFloat(retryInfo.retryDelay.replace("s", ""));
      if (!isNaN(seconds)) return Math.ceil(seconds * 1000);
    }
  } catch {
    // not JSON / not the shape we expect -- fall through to default backoff
  }
  return null;
};

const isRetryableError = (err) => {
  const status = err?.status || err?.code;
  const message = typeof err.message === "string" ? err.message : "";
  return (
    status === 429 ||
    status === 503 ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("UNAVAILABLE")
  );
};

/**
 * Calls fn() with retry-with-backoff on 429 (rate limit) and 503 (overloaded).
 * Respects Google's suggested retryDelay when present; otherwise uses
 * exponential backoff (1s, 2s, 4s, 8s, 16s).
 */
const withRetry = async (fn, label) => {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      if (!isRetryableError(err) || attempt > MAX_RETRIES) {
        throw err;
      }
      const suggestedDelay = extractRetryDelayMs(err);
      const backoffDelay = suggestedDelay ?? Math.min(1000 * 2 ** (attempt - 1), 30000);
      console.warn(
        `[embeddings] ${label} failed (attempt ${attempt}/${MAX_RETRIES}), retrying in ${backoffDelay}ms...`
      );
      await sleep(backoffDelay);
    }
  }
};

/**
 * Embeds a single string. Returns a number[] of length OUTPUT_DIMENSIONALITY.
 */
export const embedText = async (text) => {
  const result = await withRetry(
    () =>
      genAI.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: text,
        config: { outputDimensionality: OUTPUT_DIMENSIONALITY },
      }),
    "embedText"
  );
  return result.embeddings[0].values;
};

/**
 * Embeds a batch of strings in ONE API call (up to BATCH_SIZE at a time).
 * This is the key fix for large documents -- a 100-page book with 300 chunks
 * becomes ~15 API calls instead of 300.
 */
const embedBatch = async (textBatch) => {
  const result = await withRetry(
    () =>
      genAI.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: textBatch, // array of strings -- batch mode
        config: { outputDimensionality: OUTPUT_DIMENSIONALITY },
      }),
    `embedBatch (${textBatch.length} chunks)`
  );
  return result.embeddings.map((e) => e.values);
};

/**
 * Embeds all chunks for a document, batching BATCH_SIZE at a time,
 * sequentially (one batch in flight at a time) to stay well within
 * free-tier rate limits regardless of document size.
 */
export const embedChunks = async (chunks) => {
  const embeddings = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const batchEmbeddings = await embedBatch(batch);
    embeddings.push(...batchEmbeddings);
  }

  return embeddings;
};