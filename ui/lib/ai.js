const docsContent = require("./docsContent.json");
async function getAiAnswer(query) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1";
  const model = process.env.OPENAI_MODEL || "openai/gpt-4o-mini";
  const sources = ["docsContent.json"];
  if (!apiKey) {
    return {
      answer: "Set OPENAI_API_KEY in the repo root .env file.",
      sources,
    };
  }
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            "You are the J++ documentation assistant.",
            "Answer using only the documentation JSON below.",
            "If something is not in the docs, say so.",
            "",
            "Documentation JSON:",
            JSON.stringify(docsContent),
            "",
            "Question:",
            query,
          ].join("\n"),
        },
      ],
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `Model request failed (${response.status})`);
  }
  const data = await response.json();
  const answer =
    data?.choices?.[0]?.message?.content?.trim() || "No answer available.";

  return { answer, sources };
}
module.exports = { getAiAnswer };
