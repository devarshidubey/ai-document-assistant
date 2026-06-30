
```You are an expert Frontend Engineer and UI/UX Designer proficient in React, Tailwind CSS, and modern state management. 

Study but do not edit the backend code. We are building the frontend for an **AI-Driven Document Assistant**. The backend is an Express/Node.js app that processes large documents (using memory-buffered `pdf-parse`) and implements a RAG pipeline utilizing the Google GenAI SDK (`gemini-embedding-2` with an output dimensionality truncated to 768). 

Crucially, the chat assistant endpoint utilizes **Server-Sent Events (SSE)** to stream tokens incrementally, ending with a structured `"done"` event that contains document citations.

Your goal is to scaffold and implement a clean, flawless, responsive, and robust React frontend that maps perfectly to this architecture.

---

## Technical Stack Requirements
- **Framework:** React (Vite-based or Next.js Client Components—specify your preference or use standard Vite+React)
- **Styling:** Tailwind CSS (Modern, clean, developer-focused dark/light mode UI, clear focus states)
- **Icons:** `lucide-react`
- **HTTP/Streaming Client:** Native `Fetch API` (required for handling SSE stream readers cleanly)

---

## App Flow & Screen Specifications

### 1. Authentication Layer (Initial State)
- Clean, minimal **Login** and **Sign-Up** screens.
- Form inputs: Email and Password.
- Include client-side validation, error states, and loading states during authentication submission.
- Upon successful login, store the JWT token and route the user to the Main Dashboard. All subsequent API calls must pass this token in the headers as `Authorization: Bearer <token>`.

### 2. Main Layout (Sidebar + Dashboard)
- **Persistent Sidebar:**
  - **User Profile Section:** Shows logged-in user info and a logout button.
  - **"Create New Workspace" Button:** Opens a modal or inline form to input a workspace name. On success, it hits the backend to create a workspace and appends it to the workspace navigation list below.
  - **Workspace Navigation List:** Fetches and displays all available workspaces for the authenticated user. Clicking a workspace switches the active view to that workspace's view.
- **Main Content Area (Initial Dashboard View):**
  - A welcoming landing state prompting the user to select or create a workspace from the sidebar.

### 3. Active Workspace Screen (`/workspaces/:id`)
When a workspace is selected from the sidebar, the main area dynamically switches into a multi-tab interface:

#### Tab A: Documents Management (`Upload & List`)
- **Document Upload Section:**
  - A drag-and-drop zone or file picker limited to `.pdf` and `.md` files.
  - Submits files as `multipart/form-data` using a field name of `file`.
  - **Crucial UI State:** Because backend ingestion computes 100-chunk batches with a 60-second cooldown period to stay within free-tier limits, you **must** display a persistent, detailed loading spinner/progress tracker (e.g., *"Ingesting document... processing text chunks. This may take a minute for large files."*) so the user doesn't think the application has crashed.
- **All Documents List:**
  - A clean data table or grid displaying successfully uploaded files inside the active workspace.
  - Shows Metadata: Filename, upload date.

#### Tab B: Tasks Tab
- A secondary view layout inside the workspace for future task management/tracking features (placeholder layout with a clean empty-state UI).

### 4. Floating AI Assistant (Sidebar or Bottom-Right Panel)
- A persistent chat component visible when a workspace is active. It can reside as a collapsible right-hand panel or a expandable chat widget in the bottom right.
- Contains a message history log and a bottom chat input box field: `{"question": "..."}`.
- **CRITICAL REQUIREMENT: SSE Streaming Text Implementation**
  - Do **not** use standard Axios/Fetch JSON resolution for sending messages. You must use the `ReadableStream` reader via the native `fetch` API to process text increments in real-time.
  - Handle the stream parsing precisely based on these expected incoming SSE chunks:
    - `data: {"type":"token","token":"..."}` -> Extract the string fragment and append it immediately to the active assistant message bubble token-by-token.
    - `data: {"type":"done","citations":[...],"groundedInDocuments":true}` -> Stop the stream reader, close the blinking cursor animation, and cleanly map out the `citations` array (showing `filename`, `chunkIndex`) right beneath the finalized text block.

---

## Code Quality & Safety Expectations
- **Robust Error Handling:** Wrap all fetch requests in `try/catch` blocks. Gracefully catch network errors or token expiration states and display human-readable alert banners.
- **Strict Separation of Concerns:** Abstract all API interaction handlers (auth requests, workspace management, document uploading, and the SSE stream reader) into dedicated service utility files (e.g., `src/services/api.js`).
- **State Cleanup:** Ensure that if a user switches workspaces mid-stream, the active SSE stream reader closes/aborts cleanly to prevent leaks or leaking text into the wrong conversation context.

Please scaffold this structure step-by-step, starting with the folder structure, moving to the API services tier, and finalizing with the layout components.
```
