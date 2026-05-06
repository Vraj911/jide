"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";

export default function Docs() {
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, chatOpen]);

  async function sendMessage() {
    const content = input.trim();
    if (!content) return;

    const userMessage = { id: `${Date.now()}-u`, role: "user", content };
    const placeholderId = `${Date.now()}-a`;
    const nextMessages = [...messages, userMessage];
    setMessages([...nextMessages, { id: placeholderId, role: "assistant", content: "" }]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const result = await response.json();
      const sources = Array.isArray(result.sources) && result.sources.length > 0
        ? `\n\nSources:\n${result.sources.map((s) => `- ${s}`).join("\n")}`
        : "";
      const reply = response.ok
        ? `${result.answer || "No answer available."}${sources}`
        : result.error || "Failed to get response.";

      setMessages((prev) => prev.map((m) => (m.id === placeholderId ? { ...m, content: reply } : m)));
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, content: error instanceof Error ? error.message : "Unexpected error." }
            : m,
        ),
      );
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 container mx-auto px-4 pb-10">
        <h1 className="text-4xl font-bold mb-6">J++ Documentation</h1>
        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3">Language goals</h2>
            <p className="text-muted-foreground">
              J++ focuses on strict typing and clear semantics. Compilation errors are preferred over implicit runtime coercion.
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3">Type system and operators</h2>
            <p className="text-muted-foreground">
              J++ infers primitive types from literals and keeps variable types stable after first assignment. `+` is numeric-only and `.`
              is string-concatenation-only to avoid JavaScript-style mixed-type ambiguity.
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3">Compilation pipeline</h2>
            <p className="text-muted-foreground">
              Source code is tokenized, parsed into an AST, type-checked, converted to JavaScript, and then executed on the server.
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3">Compiler architecture</h2>
            <p className="text-muted-foreground">
              The compiler is split into `lexer`, `parser`, `typeChecker`, and `generator` modules under `lib/jpp`, coordinated by
              `compiler.js`. This separation keeps language evolution easier and safer.
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3">Execution model and safety</h2>
            <p className="text-muted-foreground">
              Compiled JavaScript runs in a constrained worker-thread + VM sandbox with timeout and memory ceilings. It is solid for demos
              and controlled workloads, but not equivalent to full container isolation for hostile multi-tenant workloads.
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3">IDE workflow</h2>
            <p className="text-muted-foreground">
              Use `/ide` to compile and run J++ code through `/api/execute`. Compiler output and execution logs are shown in separate panels.
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-3">Quick syntax examples</h2>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
{`ye a = 5
ye b = 10
ye total = a + b
bol total

ye first = "hello"
ye second = "world"
bol first . second`}
            </pre>
          </Card>
        </div>
      </main>

      <div className="fixed right-6 bottom-8 z-50">
        <button
          onClick={() => setChatOpen((open) => !open)}
          aria-label="Toggle docs chat"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:opacity-90"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>

      {chatOpen && (
        <div className="fixed z-50 right-6 bottom-24 w-[380px] h-[520px]">
          <div className="flex flex-col h-full bg-card rounded-lg shadow-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="font-semibold">DOT Assistant</div>
              <button onClick={() => setChatOpen(false)} className="p-1 rounded hover:bg-muted/20">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div ref={messagesRef} className="p-3 overflow-y-auto flex-1 space-y-3 text-sm">
              {messages.length === 0 && <div className="text-muted-foreground">Ask a question about the J++ docs.</div>}
              {messages.map((m) => (
                <div key={m.id} className={`rounded-lg p-3 ${m.role === "user" ? "bg-muted/30" : "bg-muted/10"}`}>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              ))}
            </div>
            <div className="px-3 py-2 border-t">
              <div className="flex items-center gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  aria-label="Docs chat input"
                  placeholder="Ask about syntax, compiler, or IDE..."
                  className="flex-1 min-h-[44px] max-h-28 resize-none bg-transparent outline-none text-sm p-2 rounded"
                />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
