const fs = require("fs/promises");
const path = require("path");
const docsContent = require("./docsContent.json");
const CACHE_KEY = "__jide_rag_index__";
const CACHE_TTL_MS = 5 * 60 * 1000;
const BUILD_ID_KEY = "__jide_rag_build_id__";
const ENV_CACHE_KEY = "__jide_rag_env__";
const MAX_CHARS_PER_CHUNK = 900;
const CHUNK_OVERLAP = 150;
const TOP_K = 4;
const MIN_SCORE = 0.03;
const MAX_CONTEXT_CHARS = 3000;
async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
async function readEnvFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const entries = {};
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;
      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      entries[key] = value;
    }
    return entries;
  } catch {
    return {};
  }
}
async function findRepoRoot(startDir) {
  let current = startDir;
  for (let i = 0; i < 6; i++) {
    if (
      (await pathExists(path.join(current, ".git"))) ||
      (await pathExists(path.join(current, "package.json")))
    ) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return startDir;
}
async function getServerEnv() {
  if (globalThis[ENV_CACHE_KEY]) return globalThis[ENV_CACHE_KEY];
  const repoRoot = await findRepoRoot(process.cwd());
  const fileEnv = {};
  for (const filePath of [
    path.join(repoRoot, ".env"),
    path.join(repoRoot, ".env.local"),
    path.join(repoRoot, "ui", ".env"),
    path.join(repoRoot, "ui", ".env.local"),
  ]) {
    Object.assign(fileEnv, await readEnvFile(filePath));
  }
  const env = { ...fileEnv, ...process.env };
  globalThis[ENV_CACHE_KEY] = env;
  return env;
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
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  return { tf, length: tokens.length };
}
async function buildIndex() {
  const chunks = [];
  for (const section of docsContent.documents || []) {
    const sectionChunks = chunkSection(section.title, section.text);
    for (const chunk of sectionChunks) {
      chunks.push({
        text: chunk,
        source: section.source || "docs",
        ...buildChunkTermData(chunk),
      });
    }
  }
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
  return { chunks, idf };
}
async function getIndex() {
  const now = Date.now();
  const buildId = process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_BUILD_ID || "local-dev";
  const cached = globalThis[CACHE_KEY];
  const cachedBuildId = globalThis[BUILD_ID_KEY];
  if (cached && cachedBuildId === buildId && now - cached.builtAt < CACHE_TTL_MS) {
    return cached.index;
  }
  const index = await buildIndex();
  globalThis[CACHE_KEY] = { index, builtAt: now };
  globalThis[BUILD_ID_KEY] = buildId;
  return index;
}
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
    .map((chunk) => ({
      chunk,
      score: scoreChunk(chunk, tokens, index.idf),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K);
}
function buildContext(chunks) {
  let context = "";

  for (const chunk of chunks) {
    const block = `[Source: ${chunk.source}]\n${chunk.text}\n\n`;
    if (context.length + block.length > MAX_CONTEXT_CHARS) break;
    context += block;
  }
  return context.trim();
}
async function fetchWithRetry(url, options, retries = 3) {
  let attempt = 0;
  let lastError = null;
  while (attempt < retries) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      const responseText = await response.text().catch(() => "");
      lastError = new Error(`HTTP ${response.status}${responseText ? `: ${responseText.slice(0, 300)}` : ""}`);
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
function safeJsonParse(text) {
  if (typeof text !== "string") return null;
  try {
    return JSON.parse(text);
  } catch {}
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}
async function buildLLMAnswer(query, chunks) {
  const context = buildContext(chunks);
  const sources = [...new Set(chunks.map((chunk) => chunk.source))];
  const env = await getServerEnv();
  const apiKey = env.OPENROUTER_API_KEY || env.OPENAI_API_KEY;
  const baseUrl = env.OPENROUTER_BASE_URL || env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1";
  const model = env.OPENROUTER_MODEL || env.OPENAI_MODEL || "openai/gpt-4o-mini";
  const provider = baseUrl.includes("openrouter.ai") ? "openrouter" : "openai-compatible";
  if (!context) {
    return {
      answer: "I cannot find the answer in the provided documentation.",
      sources: [],
      debug: { provider: "none", reason: "no_context" },
    };
  }
  if (!apiKey) {
    return {
      answer: "OpenRouter/OpenAI API key is not configured for the UI server.",
      sources,
      debug: {
        provider: "none",
        reason: "missing_api_key",
        model,
        baseUrl,
      },
    };
  }
  const payload = {
    model,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You are a strict documentation question-answering system.",
          "Answer only using the provided documentation.",
          "If the answer is not explicitly present, say: I cannot find the answer in the provided documentation.",
          "Do not use prior knowledge. Do not guess or infer.",
          'Respond only in valid JSON with keys "answer" and "sources".',
        ].join("\n"),
      },
      {
        role: "user",
        content: `Documentation:\n${context}\n\nQuestion:\n${query}`,
      },
    ],
  };
  console.log("[RAG] Calling model", { provider, model, baseUrl, query });
  let response;
  try {
    response = await fetchWithRetry(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "DOT Docs Chat",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    return {
      answer: "The model request failed before a response was returned.",
      sources,
      debug: {
        provider,
        reason: "request_failed",
        model,
        baseUrl,
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
  const data = await response.json().catch(() => null);
  const providerError = data?.error?.message || data?.error;
  if (providerError) {
    return {
      answer: "The model provider returned an error.",
      sources,
      debug: {
        provider,
        reason: "provider_error",
        model,
        baseUrl,
        error: typeof providerError === "string" ? providerError : JSON.stringify(providerError),
      },
    };
  }
  const text = data?.choices?.[0]?.message?.content;
  const parsed = safeJsonParse(text);
  if (parsed) {
    return {
      answer: parsed.answer || "I cannot find the answer in the provided documentation.",
      sources: Array.isArray(parsed.sources) && parsed.sources.length ? parsed.sources : sources,
      debug: {
        provider,
        reason: "ok",
        model,
        baseUrl,
      },
    };
  }
  return {
    answer: typeof text === "string" && text.trim()
      ? text.trim()
      : "The model returned an unreadable response.",
    sources,
    debug: {
      provider,
      reason: "invalid_json_response",
      model,
      baseUrl,
      raw: typeof text === "string" ? text.slice(0, 500) : null,
    },
  };
}
async function getRagAnswer(query) {
  const index = await getIndex();
  const scored = searchChunks(index, query);
  if (!scored.length || scored[0].score < MIN_SCORE) {
    return {
      answer: "I cannot find the answer in the provided documentation.",
      sources: [],
      debug: { provider: "none", reason: "low_retrieval_score" },
    };
  }
  const chunks = scored.map((entry) => entry.chunk);
  return buildLLMAnswer(query, chunks);
}
module.exports = { getRagAnswer };
