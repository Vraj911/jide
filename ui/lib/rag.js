const fs = require("fs/promises");
const path = require("path");

/* ===================== CONFIG ===================== */

const CACHE_KEY = "__jide_rag_index__";
const CACHE_TTL_MS = 5 * 60 * 1000;
const BUILD_ID_KEY = "__jide_rag_build_id__";

// Chunking
const MAX_CHARS_PER_CHUNK = 900;
const CHUNK_OVERLAP = 150;

// Retrieval
const TOP_K = 4;
const MIN_SCORE = 0.03; // ↓ lowered for small-doc corpus

// LLM
const MAX_CONTEXT_CHARS = 3000;

// Ignore dirs (safety)
const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  "out",
]);

/* ===================== FS HELPERS ===================== */

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function findRepoRoot(startDir) {
  let current = startDir;
  for (let i = 0; i < 6; i++) {
    if (
      (await pathExists(path.join(current, ".git"))) ||
      (await pathExists(path.join(current, "JPP_README.md")))
    ) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return startDir;
}

/* ===================== SOURCE SELECTION ===================== */
/**
 * IMPORTANT:
 * We intentionally index J++ language documentation.
 */
async function collectMarkdownFiles(rootDir) {
  const candidates = [
    path.join(rootDir, "JPP_README.md"),
    path.join(rootDir, "rag.md"),
  ];
  const files = [];
  for (const file of candidates) {
    if (await pathExists(file)) files.push(file);
  }
  return files;
}

/* ===================== MARKDOWN PROCESSING ===================== */

function sectionizeMarkdown(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  let current = { title: "", content: "" };

  for (const line of lines) {
    if (/^#{1,6}\s+/.test(line)) {
      if (current.content.trim()) sections.push(current);
      current = {
        title: line.replace(/^#{1,6}\s+/, "").trim(),
        content: "",
      };
    } else {
      current.content += line + "\n";
    }
  }

  if (current.content.trim()) sections.push(current);
  return sections;
}

function chunkSection(title, content) {
  const clean = content.trim();
  if (!clean) return [];

  const chunks = [];
  let start = 0;

  while (start < clean.length) {
    const end = Math.min(start + MAX_CHARS_PER_CHUNK, clean.length);
    const slice = clean.slice(start, end);
    const text = title ? `${title}\n${slice}` : slice;

    chunks.push(text.trim());
    if (end === clean.length) break;
    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}

/* ===================== TOKENIZATION ===================== */
/**
 * Fixes:
 * - J++ → jpp
 * - C++ → cpp
 */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/\+\+/g, "pp");
}

function tokenize(text) {
  return normalize(text).match(/[a-z0-9]+/g) || [];
}

function buildChunkTermData(text) {
  const tokens = tokenize(text);
  const tf = Object.create(null);

  for (const t of tokens) {
    tf[t] = (tf[t] || 0) + 1;
  }

  return { tf, length: tokens.length };
}

/* ===================== INDEX BUILD ===================== */

async function buildIndex() {
  const repoRoot = await findRepoRoot(process.cwd());
  const files = await collectMarkdownFiles(repoRoot);
  const chunks = [];

  for (const filePath of files) {
    const raw = await fs.readFile(filePath, "utf-8");
    const sections = sectionizeMarkdown(raw);

    for (const section of sections) {
      const sectionChunks = chunkSection(section.title, section.content);

      for (const chunk of sectionChunks) {
        chunks.push({
          text: chunk,
          source: path.relative(repoRoot, filePath).replace(/\\/g, "/"),
          ...buildChunkTermData(chunk),
        });
      }
    }
  }

  // Build IDF
  const docCount = chunks.length || 1;
  const df = Object.create(null);

  for (const chunk of chunks) {
    for (const term of Object.keys(chunk.tf)) {
      df[term] = (df[term] || 0) + 1;
    }
  }

  const idf = Object.create(null);
  for (const term of Object.keys(df)) {
    idf[term] = Math.log(1 + docCount / (1 + df[term]));
  }

  return { repoRoot, chunks, idf };
}

async function getIndex() {
  const now = Date.now();
  const buildId = process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_BUILD_ID || "local-dev";
  const cached = globalThis[CACHE_KEY];
  const cachedBuildId = globalThis[BUILD_ID_KEY];
  if (cached && cachedBuildId === buildId && now - cached.builtAt < CACHE_TTL_MS) return cached.index;
  const index = await buildIndex();
  globalThis[CACHE_KEY] = { index, builtAt: now };
  globalThis[BUILD_ID_KEY] = buildId;
  return index;
}

/* ===================== RETRIEVAL ===================== */

function scoreChunk(chunk, queryTokens, idf) {
  if (!chunk.length) return 0;

  let score = 0;
  for (const token of queryTokens) {
    const freq = chunk.tf[token];
    if (!freq) continue;
    score += (freq / chunk.length) * (idf[token] || 0);
  }
  return score;
}

function searchChunks(index, query) {
  const tokens = tokenize(query);

  return index.chunks
    .map(chunk => ({
      chunk,
      score: scoreChunk(chunk, tokens, index.idf),
    }))
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K);
}

/* ===================== CONTEXT ===================== */

function buildContext(chunks) {
  let context = "";

  for (const chunk of chunks) {
    const block = `[Source: ${chunk.source}]\n${chunk.text}\n\n`;
    if (context.length + block.length > MAX_CONTEXT_CHARS) break;
    context += block;
  }

  return context.trim();
}

/* ===================== LLM ANSWER ===================== */

async function fetchWithRetry(url, options, retries = 3) {
  let attempt = 0;
  let lastError = null;
  while (attempt < retries) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    attempt += 1;
    if (attempt < retries) {
      const waitMs = 200 * (2 ** attempt);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
  throw lastError || new Error("Failed to call LLM endpoint");
}

async function buildLLMAnswer(query, chunks) {
  const context = buildContext(chunks);
  const sources = [...new Set(chunks.map(c => c.source))];

  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!context) {
    return {
      answer: "I cannot find the answer in the provided documentation.",
      sources: [],
    };
  }
  if (!apiKey) {
    return {
      answer: chunks[0]?.text?.slice(0, 600) || "I cannot find the answer in the provided documentation.",
      sources,
    };
  }

  const payload = {
    model,
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
You are a strict documentation question-answering system.

Rules:
1. Answer ONLY using the provided documentation.
2. If the answer is not explicitly present, say:
   "I cannot find the answer in the provided documentation."
3. Do NOT use prior knowledge.
4. Do NOT guess or infer.
5. Respond ONLY in valid JSON:
{
  "answer": string,
  "sources": string[]
}
`,
      },
      {
        role: "user",
        content: `Documentation:\n${context}\n\nQuestion:\n${query}`,
      },
    ],
  };

  console.log("🚀 Calling LLM for query:", query);

  let res;
  try {
    res = await fetchWithRetry(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "DOT Docs Chat",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      answer: chunks[0]?.text?.slice(0, 600) || "I cannot find the answer in the provided documentation.",
      sources,
    };
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;

  try {
    return JSON.parse(text);
  } catch {
    return {
      answer: chunks[0]?.text?.slice(0, 600) || "I cannot find the answer in the provided documentation.",
      sources,
    };
  }
}

/* ===================== PUBLIC API ===================== */

async function getRagAnswer(query) {
  const index = await getIndex();
  const scored = searchChunks(index, query);

  if (!scored.length || scored[0].score < MIN_SCORE) {
    return {
      answer: "I cannot find the answer in the provided documentation.",
      sources: [],
    };
  }

  const chunks = scored.map(s => s.chunk);
  return buildLLMAnswer(query, chunks);
}

module.exports = { getRagAnswer };
