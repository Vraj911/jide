# RAG (DOT Docs Chat) — What Was Done

This document summarizes the changes made to make DOT answer questions from the project’s Markdown docs on the `/docs` page.

## Goal

Enable DOT (the floating chat on `/docs`) to use Retrieval-Augmented Generation (RAG) so responses are grounded in the J++ language documentation.

## High-Level Architecture

1. **Frontend** (`/docs` page)
   - Sends the user’s message to a backend API endpoint (`POST /api/chat`).
   - Receives JSON `{ answer, sources }` and renders it in the chat UI.

2. **Backend API** (`/api/chat`)
   - Reads the latest user message.
   - Runs a RAG pipeline that:
     - Indexes the J++ language docs.
     - Retrieves the most relevant chunks.
     - Optionally uses an LLM to summarize, otherwise returns extractive snippets.

3. **RAG Library** (`apps/ui/lib/rag.js`)
   - Builds a lightweight in-memory index of Markdown content using TF-IDF scoring.
   - Caches the index for performance.
   - Supports optional OpenAI generation when `OPENAI_API_KEY` is set.

## Important Update (Your Request)

**Context is now restricted to `jpp.md` only.**

When building the RAG index, the code checks for `jpp.md` in the repo root. If it exists, **only that file is indexed and used as context for the LLM**. This separates language docs from project docs.

If `jpp.md` does **not** exist, it falls back to indexing all `.md` files **except** `PROJECT_README.md`.

## Files Added/Updated

### 1) `jpp.md`

New language documentation file that contains:

- J++ philosophy and goals
- Operator rules (`+` for numbers, `.` for strings)
- Type system rules
- Valid/invalid examples
- Compiler pipeline overview
- Operator precedence
- References to core compiler files

### 2) `apps/ui/lib/rag.js`

Implements the RAG pipeline with the new context behavior:

- **Repo scan**
  - If `jpp.md` exists, index **only that file**.
  - Otherwise, recursively search for `.md` files, excluding `PROJECT_README.md`.
  - Skips large/irrelevant directories (`node_modules`, `.git`, `.next`, `dist`, `build`, `coverage`, `out`).

- **Chunking**
  - Splits Markdown by headings.
  - Further splits into overlapping chunks (default `900` chars, `150` overlap).

- **Indexing**
  - Creates term frequency maps for each chunk.
  - Builds a simple IDF (inverse document frequency) table.

- **Retrieval**
  - Tokenizes the query and scores chunks by TF-IDF.
  - Returns top K chunks (default `6`).

- **Answering**
  - If `OPENAI_API_KEY` is present, it calls OpenAI Chat Completions with the retrieved context.
  - If not, it returns an extractive answer with the most relevant snippets.

Environment variables supported:

- `OPENAI_API_KEY` (required for LLM answers)
- `OPENAI_MODEL` (default: `gpt-4o-mini`)
- `OPENAI_BASE_URL` (default: `https://api.openai.com`)

### 3) `apps/ui/app/api/chat/route.js`

Next.js API route:

- Accepts `POST` JSON with `messages`.
- Finds the most recent user message and uses it as the query.
- Calls `getRagAnswer` from `rag.js`.
- Returns `{ answer, sources }`.

Also sets:

- `runtime = "nodejs"` (needed for filesystem access)
- `dynamic = "force-dynamic"`

### 4) `apps/ui/app/docs/page.js`

Updated the chat behavior:

- Sends the conversation to `/api/chat`.
- Renders the returned answer.
- If `sources` are present, they are appended as a list.
- Handles errors gracefully with a fallback message.

### 5) `PROJECT_README.md`

- Language details removed.
- Now points to `jpp.md` for language documentation.

## How It Works End-to-End

1. User types a question in DOT on `/docs`.
2. Frontend posts `{ messages }` to `/api/chat`.
3. Backend:
   - Uses `jpp.md` as the only context (if present).
   - Retrieves the most relevant chunks.
   - Returns either:
     - **LLM response** (if `OPENAI_API_KEY` is set), or
     - **Extractive snippets** (if no API key).
4. Frontend renders the answer + sources.

## Usage Notes

- Without an API key, DOT still works but replies are extracted text from `jpp.md`.
- With an API key, DOT uses the retrieved context to produce a cleaner summary.
- Sources are always shown when available so users can verify the docs.

## What You Can Customize

In `apps/ui/lib/rag.js`:

- `TOP_K` — number of chunks to retrieve
- `MAX_CONTEXT_CHARS` — total context passed to the LLM
- `MAX_CHARS_PER_CHUNK` / `CHUNK_OVERLAP` — chunk sizing
- `IGNORE_DIRS` — directories to skip during doc scanning

## Quick Test

1. Run the UI app.
2. Open `/docs`.
3. Ask: "What is J++?" or "What is the `.` operator?".
4. You should see answers grounded in `jpp.md`.

## Summary

DOT now uses RAG with `jpp.md` as the sole source of truth for language context. It indexes that file, retrieves relevant chunks, and replies with either extractive snippets or an LLM-generated answer—always tied to the J++ language documentation.
