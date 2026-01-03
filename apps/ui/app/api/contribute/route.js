import path from "path";
import { promises as fsp } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, title, description, code, name, email } = body;

    if (!type || !title) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const contributionsDir = path.resolve(__dirname, "../../../../../contributions");
    try {
      await fsp.mkdir(contributionsDir, { recursive: true });
    } catch (e) {
    }

    const timestamp = new Date().toISOString();
    const filename = `${timestamp.replace(/[:.]/g, "-")}-${type}-${title.replace(/[^a-z0-9_-]/gi, "-")}.json`;
    const filepath = path.join(contributionsDir, filename);

    const submission = { type, title, description, code: code || null, name: name || null, email: email || null, timestamp };

    if (code && (type === "example" || type === "patch")) {
      try {
        const mod = await import("../../../../../lib/jpp/compiler.js");
        const compile = mod.default || mod.compile || mod;
        const result = await Promise.resolve(compile(code));
        submission.compile = { success: !!result.success, errors: result.errors || [] };
      } catch (err) {
        submission.compile = { success: false, errors: [{ message: "Compile error", detail: String(err) }] };
      }
    }

    await fsp.writeFile(filepath, JSON.stringify(submission, null, 2), "utf-8");

    return new Response(JSON.stringify({ success: true, path: `/contributions/${path.basename(filepath)}`, compile: submission.compile || null }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
