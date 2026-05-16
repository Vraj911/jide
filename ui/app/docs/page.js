"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Braces, Cpu, MessageSquare, Sparkles, Workflow, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import docsContent from "@/lib/docsContent.json";

const iconMap = {
  language: BookOpen,
  syntax: Braces,
  compiler: Workflow,
  lsp: Sparkles,
  runtime: Cpu,
};

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
          messages: nextMessages.map((message) => ({ role: message.role, content: message.content })),
        }),
      });

      const result = await response.json();
      const sources =
        Array.isArray(result.sources) && result.sources.length > 0
          ? `\n\nSources:\n${result.sources.map((source) => `- ${source}`).join("\n")}`
          : "";
      const reply = response.ok
        ? `${result.answer || "No answer available."}${sources}`
        : result.error || "Failed to get response.";

      setMessages((prev) => prev.map((message) => (message.id === placeholderId ? { ...message, content: reply } : message)));
    } catch (error) {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === placeholderId
            ? { ...message, content: error instanceof Error ? error.message : "Unexpected error." }
            : message,
        ),
      );
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto flex-1 px-4 pb-12 pt-20">
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/40 px-6 py-10 backdrop-blur sm:px-8 sm:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_30%)]" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.35fr_0.9fr]">
            <div className="space-y-5">
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-primary">{docsContent.hero.eyebrow}</p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{docsContent.hero.title}</h1>
              <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
                {docsContent.hero.description}
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {docsContent.hero.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-border/60 bg-background/60 px-3 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <Card className="border-border/60 bg-background/70 p-5">
              <h2 className="mb-4 text-lg font-semibold">On this page</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {docsContent.sections.map(({ id, title, summary }) => {
                  const Icon = iconMap[id];
                  return (
                  <a key={id} href={`#${id}`} className="rounded-xl border border-border/50 bg-card/60 p-4 transition-colors hover:border-primary/50 hover:bg-card">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Icon className="h-4 w-4 text-primary" />
                      <span>{title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{summary}</p>
                  </a>
                )})}
              </div>
            </Card>
          </div>
        </section>

        <section id="language" className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-6">
            <h2 className="mb-3 text-2xl font-semibold">Why J++ exists</h2>
            <p className="mb-4 text-muted-foreground">
              J++ is intentionally small, but it is not loose. The language is built to reject ambiguity early. In JavaScript,
              mixed-type expressions can silently coerce values. In J++, those same mistakes fail during compilation.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {docsContent.principles.map((principle) => (
                <div key={principle.title} className="rounded-xl border border-border/50 bg-card/50 p-4">
                  <div className="mb-1 text-sm font-semibold">{principle.title}</div>
                  <p className="text-sm text-muted-foreground">{principle.text}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-3 text-2xl font-semibold">Quick syntax</h2>
            <pre className="overflow-x-auto rounded-2xl border border-border/50 bg-panel-bg p-4 text-sm text-muted-foreground whitespace-pre-wrap">
              {docsContent.syntaxExample}
            </pre>
          </Card>
        </section>

        <section id="syntax" className="mt-8 grid gap-6">
          <Card className="p-6">
            <h2 className="mb-3 text-2xl font-semibold">Types and operators</h2>
            <p className="mb-5 text-muted-foreground">
              J++ currently works with two primitive types: `number` and `string`. Type inference happens on declaration, and reassignment
              must preserve that inferred type.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-foreground">
                  <tr className="border-b border-border/60">
                    <th className="px-3 py-3 font-semibold">Operator</th>
                    <th className="px-3 py-3 font-semibold">Allowed usage</th>
                    <th className="px-3 py-3 font-semibold">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {docsContent.operatorRows.map(([operator, usage, description]) => (
                    <tr key={operator} className="border-b border-border/40">
                      <td className="px-3 py-3 font-mono text-primary">{operator}</td>
                      <td className="px-3 py-3 text-muted-foreground">{usage}</td>
                      <td className="px-3 py-3 text-muted-foreground">{description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {docsContent.keywordGroups.map((group) => (
              <Card key={group.title} className="p-6">
                <h3 className="mb-4 text-xl font-semibold">{group.title}</h3>
                <div className="space-y-3">
                  {group.items.map(([keyword, description]) => (
                    <div key={keyword} className="rounded-xl border border-border/50 bg-card/50 p-4">
                      <div className="mb-1 font-mono text-sm text-primary">{keyword}</div>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="mb-3 text-xl font-semibold">Control flow example</h3>
              <pre className="overflow-x-auto rounded-2xl border border-border/50 bg-panel-bg p-4 text-sm text-muted-foreground whitespace-pre-wrap">
                {docsContent.flowExample}
              </pre>
            </Card>
            <Card className="p-6">
              <h3 className="mb-3 text-xl font-semibold">Operator precedence</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                {docsContent.precedence.map((item, index) => (
                  <li key={item}>{index + 1}. {item}</li>
                ))}
              </ol>
            </Card>
          </div>
        </section>

        <section id="compiler" className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="p-6">
            <h2 className="mb-3 text-2xl font-semibold">Compiler pipeline</h2>
            <pre className="mb-4 overflow-x-auto rounded-2xl border border-border/50 bg-panel-bg p-4 text-sm text-muted-foreground whitespace-pre-wrap">
              {docsContent.compileExample}
            </pre>
            <p className="text-sm text-muted-foreground">
              The compiler is split across `lexer`, `parser`, `typeChecker`, and `generator` modules under `lib/jpp`. That separation is
              what makes the IDE and the language server able to share the same semantic rules.
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-2xl font-semibold">What each stage does</h2>
            <div className="space-y-4">
              {docsContent.compilerStages.map((stage) => (
                <div key={stage.title} className="rounded-xl border border-border/50 bg-card/50 p-4">
                  <div className="mb-1 font-semibold">{stage.title}</div>
                  <p className="text-sm text-muted-foreground">{stage.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section id="lsp" className="mt-8 grid gap-6">
          <Card className="p-6">
            <h2 className="mb-3 text-2xl font-semibold">LSP in the J++ IDE</h2>
            <p className="mb-5 text-muted-foreground">
              The editor talks to a standalone language server over WebSocket. That server implements JSON-RPC based LSP methods and keeps
              the currently open document in memory so it can answer language questions quickly.
            </p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {docsContent.lspFeatures.map((feature) => (
                <div key={feature.title} className="rounded-xl border border-border/50 bg-card/50 p-4">
                  <div className="mb-1 font-semibold">{feature.title}</div>
                  <p className="text-sm text-muted-foreground">{feature.text}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <Card className="p-6">
              <h3 className="mb-4 text-xl font-semibold">Request lifecycle</h3>
              <div className="space-y-3">
                {docsContent.lifecycleSteps.map(([label, description]) => (
                  <div key={label} className="rounded-xl border border-border/50 bg-card/50 p-4">
                    <div className="mb-1 font-semibold">{label}</div>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4 text-xl font-semibold">Implementation details that matter</h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                {docsContent.implementationDetails.map((item) => (
                  <div key={item.title} className="rounded-xl border border-border/50 bg-card/50 p-4">
                    <div className="mb-1 font-semibold text-foreground">{item.title}</div>
                    {item.text}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section id="runtime" className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="p-6">
            <h2 className="mb-3 text-2xl font-semibold">Execution model</h2>
            <p className="text-muted-foreground">
              {docsContent.runtime.execution}
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="mb-3 text-2xl font-semibold">Docs assistant</h2>
            <p className="text-muted-foreground">
              {docsContent.runtime.assistant}
            </p>
          </Card>
        </section>
      </main>

      <div className="fixed bottom-6 right-4 z-50 sm:bottom-8 sm:right-6">
        <button
          onClick={() => setChatOpen((open) => !open)}
          aria-label="Toggle docs chat"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:opacity-90"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      </div>

      {chatOpen && (
        <div className="fixed bottom-20 left-4 right-4 z-50 h-[min(70vh,520px)] sm:bottom-24 sm:left-auto sm:right-6 sm:w-[380px]">
          <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <div className="font-semibold">DOT Assistant</div>
              <button onClick={() => setChatOpen(false)} className="rounded p-1 hover:bg-muted/20">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto p-3 text-sm">
              {messages.length === 0 && <div className="text-muted-foreground">Ask a question about J++, compilation, or LSP behavior.</div>}
              {messages.map((message) => (
                <div key={message.id} className={`rounded-lg p-3 ${message.role === "user" ? "bg-muted/30" : "bg-muted/10"}`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              ))}
            </div>
            <div className="border-t px-3 py-2">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  aria-label="Docs chat input"
                  placeholder="Ask about syntax, compiler, or LSP..."
                  className="min-h-[44px] max-h-28 flex-1 resize-none rounded bg-transparent p-2 text-sm outline-none"
                />
                <Button onClick={sendMessage} className="shrink-0">
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
