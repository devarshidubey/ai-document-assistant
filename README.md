# Multi-Workspace Document Assistant (RAG & Tool Calling)
 
A workspace-isolated document Q&A assistant: upload documents into a workspace, ask grounded questions answered only from that workspace's content, with streaming responses, source citations, and an AI assistant that can take real actions (save tasks, post Discord summaries) via tool calling.
 
---
 
## Quick test (for recruiters / reviewers)
 
**Live URL**: https://ai-document-assistant-plum.vercel.app
 
**Test login**:
```
Email:    testuser@mail.com
Password: Test1234%
```
 
This account has two preloaded workspaces, each with two documents already ingested, so you can test everything immediately without uploading anything yourself.

NOTE: The Google AI API has a daily limit of 20 requests per day so test prudently please :)
 
### What to try
 
1. **Log in** with the credentials above.
2. You'll see two workspaces in the sidebar.
3. Open the chat assistant inside either workspace and ask the questions below.
4. Check the **Documents** tab to see what's been uploaded, and the **Tasks** tab after asking the assistant to save a task.
### Sample questions: test-workspace-1
 
| Question | Expected behavior |
|---|---|
| "How many days of paid annual leave do Acme employees get?" | Answers 24 days, cites `acme-hr-policy.md` |
| "What is Project Sunflower?" | Describes the 2025 office restructuring plan, cites `acme-hr-policy.md` |
| "When are production deployments allowed at Acme?" | Cites the Mon-Thu, 10am-3pm IST window, cites `acme-engineering-standards.md` |
| "What is Operation Falcon Key?" | Describes the encryption key rotation process |
| "Save a task to follow up on the Project Sunflower timeline." | Triggers the `save_task` tool -- check the **Tasks** tab afterward |
 
### Sample questions: test-workspace-2
 
| Question | Expected behavior |
|---|---|
| "What is Project Crimson?" | Describes the Series B raise ($18M at $90M valuation), cites `nova-product-roadmap.md` |
| "Where are Nova's disaster recovery backups stored?" | Mentions Frankfurt / "The Blue Vault," cites `nova-security-policy.md` |
| "What is Nova's RTO and RPO?" | Answers 4 hours / 6 hours respectively |
| "What are Nova's Q4 2025 product priorities?" | Multi-currency support, iOS app, API rate limiting |
| "Post a Discord summary saying Nova's security policy has been reviewed." | Triggers the `send_discord_summary` tool -- posts to the configured Discord channel |
 
### The isolation test (the most important one)
 
This is the core guarantee of the system: **a workspace's documents are never visible from another workspace**, even though all chunks live in one shared Postgres table.
 
From the **test-workspace-1** workspace, ask:
- "What is Project Sunflower?" -> should say it doesn't know (this fact only exists in Acme's documents)
- "What is Operation Falcon Key?" -> should say it doesn't know
- "How many days of annual leave do employees get?" -> should say it doesn't know
From the **test-workspace-2** workspace, ask:
- "What is Project Crimson?" -> should say it doesn't know (this fact only exists in Nova's documents)
- "Where is The Blue Vault?" -> should say it doesn't know
If any of these leak content from the other workspace, isolation is broken. They should all return an honest "I don't know" -- the assistant never guesses or falls back to general knowledge.
 
### Honest "I don't know" test (either workspace)
 
Ask something genuinely outside both document sets, e.g. *"What is the capital of France?"* -- the assistant should say it doesn't have that information in the available documents, rather than answering from general knowledge. This is intentional: the assistant is grounded-only by design.
 
---
 
## Quality bar — what's implemented
 
- **Strict workspace isolation**: every chunk retrieval query filters by `workspace_id` inside the SQL itself (`WHERE workspace_id = $1 ORDER BY embedding <=> $2`), never as a post-fetch filter in application code. Tool execution also injects `workspace_id` from the authenticated request context -- it is never read from the LLM's tool-call arguments, so a prompt injection attempt cannot redirect an action to a different workspace.
- **Grounded, not hallucinated**: answers are generated only from retrieved chunks above a relevance threshold; citations (document, filename, chunk index) are returned with every answer; when no relevant chunks are found, the assistant says it doesn't know rather than guessing.
- **Safe tool execution**: every tool call's arguments are validated against a schema before execution. Unknown tool names and malformed/missing arguments are caught, logged, and returned as a clean error -- they never crash the request or execute unintended behavior.
- **Resistant to prompt injection**: the system prompt explicitly frames retrieved document text as data to read, never as instructions to follow, and forbids the model from calling tools because a document told it to -- only an explicit request from the actual user in the conversation can trigger a tool call.
- **No lost work, idempotent ingestion**: the user's question is persisted before the LLM call runs, so it's never lost even if the LLM call fails. Document ingestion is content-hash-based and idempotent -- re-uploading the same file into the same workspace is detected and short-circuited rather than creating duplicate chunks.
- **No secrets exposed**: API keys, the JWT secret, and the Discord webhook URL are read only from server-side environment variables, never included in any tool schema, client response, or committed file.
## Stretch goals implemented (4 of 6)
 
1. **Retrieval-debug visibility** -- every chat response includes which workspace, document, and chunk(s) the answer was actually retrieved from (`documentId`, `filename`, `chunkIndex` per citation), making isolation and grounding directly verifiable per response rather than just asserted.
2. **Streaming responses** -- the assistant's final answer streams token-by-token over a Server-Sent-Events-style connection, rather than waiting for the full response to generate before showing anything.
3. **Multi-step tool use** -- the tool-calling loop supports the model calling a tool, seeing the result, and deciding whether to call another tool before producing its final answer (bounded by a hard iteration cap to prevent runaway loops).
4. **Observability** -- every tool call (successful or failed) is logged with its arguments, result, status, and error message, scoped per workspace and viewable via the dashboard.
Not implemented: hybrid search/re-ranking, explicit cross-workspace document sharing.
 
---
 
## Local development setup
 
### Prerequisites
 
- Node.js 18+
- A Supabase (or Neon) Postgres project with the `pgvector` extension enabled
- A Google Gemini API key (free tier, via [Google AI Studio](https://aistudio.google.com))
- A Discord webhook URL (optional -- only needed to test the `send_discord_summary` tool)
### 1. Clone and install
 
```bash
git clone git@github.com:devarshidubey/ai-document-assistant.git
cd ai-document-assistant
 
cd backend && npm install
cd ../frontend && npm install
```
 
### 2. Database setup
 
1. Create a Supabase project, enable the `pgvector` extension (Database -> Extensions).
2. Open the SQL Editor and run the full contents of `backend/src/db/schema.sql`.
3. Copy your connection string (use the connection pooler URI, not the direct connection) from Project Settings -> Database.
### 3. Environment variables
 
Copy `.env.example` to `.env` in both `backend/` and `frontend/`, and fill in real values:
 
**`backend/.env`**
```
PORT=4000
DATABASE_URL=postgresql://...        # Supabase pooler connection string
JWT_SECRET=<any long random string>
GEMINI_API_KEY=<your Gemini API key>
DISCORD_WEBHOOK_URL=<your Discord webhook URL>   # optional
```
 
**`frontend/.env`**
```
VITE_API_URL=http://localhost:4000
```
 
### 4. Run locally
 
```bash
# terminal 1
cd backend
npm run dev
 
# terminal 2
cd frontend
npm run dev
```
 
Backend runs on `http://localhost:4000`, frontend on `http://localhost:5173` (Vite default).
 
Confirm the backend is wired up correctly:
```bash
curl http://localhost:4000/health      # -> {"ok":true,...}
curl http://localhost:4000/health/db   # -> {"ok":true,"db":{"ok":1}}
```
 
### 5. Try it locally
 
Sign up a new account, create two workspaces, upload a couple of documents into each (the sample documents used for the deployed test account are in `sample-docs/` in this repo, if you want to recreate the same test scenario locally), and ask questions through the chat assistant.
 
---
 
## Deployment
 
- **Backend**: deployed on [Render] as a Node web service. Environment variables are set directly in the host's dashboard, not committed to the repo.
- **Frontend**: deployed on [Vercel], with `VITE_API_URL` pointed at the deployed backend URL.
- **Database**: Supabase (Postgres + pgvector), free tier.
---
 
 
See `AI_NOTES.md` for details on how AI tools were used during development, key decisions made, and the hardest bug encountered along the way.
 
