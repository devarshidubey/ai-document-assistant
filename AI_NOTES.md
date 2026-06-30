# AI_NOTES.md
 
## AI tools used
 
Backend built mostly in conversation with **Claude (Sonnet 4.6)** in the normal chat interface, no `CLAUDE.md`/`.cursorrules`. I drove all decisions and testing; Claude implemented most pieces and flagged tradeoffs. No AI context file was used.

The frontend is built entirely with Cursor's agent, using a single detailed upfront prompt covering the full architecture (see the prompt in the repo). No further input was required.

 
 
## Decisions I made myself
 
1. **No S3, no worker queues.** Had a choice to implement a dedicated upload pipeline to store the documents as editable files in a blob storage (didnt do that).
2. **Rolled my own JWT auth** (bcrypt + jsonwebtoken) instead of Supabase Auth. I adopted single token authentication, but can be expanded to a refresh-access token pattern (didnt wanna overengineer).
3. **Isolation enforced at the SQL layer everywhere** every query filters by `workspace_id` inside the query itself; tool execution always injects `workspace_id` from the authenticated request.
4. **Embedding dimensionality**: Gemini's `gemini-embedding-001` defaults to 3072 dims, which exceeds pgvector's 2000-dim `hnsw` index limit. Claude suggested reducing to 1536 without strong justification so I chose 768 myself, since I feel the accuracy difference would've been negligible. For a higher volume scenario tho, I would have forced for the 3072 dimensions.
## Hardest parts
 
1. **`pdf-parse` import kept breaking.** Claude's attempts to use the pdf-parse library were failing repeatedly due to oudated usage. Had to check the actual docs mylself rather than guess.
2. **Claude built the embeddings service on a deprecated package**, `@google/generative-ai`, which was throwing a 404 because the underlying model (`text-embedding-004`) had been shut down by Google. Claude's advice was to patch the model name within the old SDK. Refering to the docs, I found that `@google/genai` was the newer client and had different members and methods.
3. **Large PDF uploads triggered Gemini rate limits.** A 100+ page document produced hundreds of per-chunk embedding calls, getting blocked by the free-tier rpm quota (`429`) and occasionally hitting `503` overload errors. Fixed by batching multiple chunks per embedding call and adding retry-with-exponential-backoff that follows Google's suggested retry delay, giving the API time to cool down between attempts. An early version of this had a bug where a malformed retry delay parsed to `0ms`, causing near-instant retry loops, so i added a minimum delay floor to actually fix.
