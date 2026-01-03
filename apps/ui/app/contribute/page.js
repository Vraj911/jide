"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

function FormRow({ children }) {
  return <div className="mt-3">{children}</div>;
}

export default function ContributePage() {
  const { toast } = useToast();

  // Issue form
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDesc, setIssueDesc] = useState("");
  const [issueName, setIssueName] = useState("");

  // Example form
  const [exampleTitle, setExampleTitle] = useState("");
  const [exampleDesc, setExampleDesc] = useState("");
  const [exampleCode, setExampleCode] = useState("ye a = 1\nbol a");

  // Patch form
  const [patchTitle, setPatchTitle] = useState("");
  const [patchDesc, setPatchDesc] = useState("");
  const [patchCode, setPatchCode] = useState("");

  async function submit(type, payload, clearFn) {
    try {
      const res = await fetch("/api/contribute", { method: "POST", body: JSON.stringify({ type, ...payload }), headers: { "Content-Type": "application/json" } });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Unknown error");

      toast({ title: "Submitted", description: `Thanks for your ${type}. Saved to ${json.path}` });
      clearFn?.();
    } catch (err) {
      toast({ title: "Submission failed", description: String(err) });
    }
  }

  return (
    <main className="container mx-auto px-4 py-24">
      <h1 className="text-4xl font-bold mb-2">Contribute to J++</h1>
      <p className="text-muted-foreground mb-4">Submit examples, report issues, or propose patches directly from this site — no GitHub workflow required.</p>
      <div className="mb-6">
        <Link href="/contribute/submissions">
          <Button variant="ghost" size="sm">View submissions</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 text-sm text-muted-foreground">Submissions are stored privately in this project and will be reviewed by maintainers. Please avoid including secrets or private data. Provide contact info if you want follow-up.</div>
        <Card>
          <CardHeader>
            <CardTitle>Report an issue</CardTitle>
            <CardDescription>Quickly report bugs or problems in the language or IDE</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="text-sm">Title</label>
            <Input value={issueTitle} onChange={(e) => setIssueTitle(e.target.value)} placeholder="Short summary" />
            <FormRow>
              <label className="text-sm">Description</label>
              <textarea rows={6} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={issueDesc} onChange={(e) => setIssueDesc(e.target.value)} placeholder="Steps to reproduce, expected vs actual..." />
            </FormRow>
            <FormRow>
              <label className="text-sm">Your name (optional)</label>
              <Input value={issueName} onChange={(e) => setIssueName(e.target.value)} placeholder="Jane Doe" />
            </FormRow>
          </CardContent>
          <CardFooter className="justify-end">
            <Button size="sm" onClick={() => submit("issue", { title: issueTitle, description: issueDesc, name: issueName }, () => { setIssueTitle(""); setIssueDesc(""); setIssueName(""); })}>Submit</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submit an example</CardTitle>
            <CardDescription>Share a small J++ program or test case</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="text-sm">Title</label>
            <Input value={exampleTitle} onChange={(e) => setExampleTitle(e.target.value)} placeholder={'E.g. "Numbers addition example"'} />
            <FormRow>
              <label className="text-sm">Description</label>
              <textarea rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={exampleDesc} onChange={(e) => setExampleDesc(e.target.value)} placeholder="What the example demonstrates" />
            </FormRow>
            <FormRow>
              <label className="text-sm">Code</label>
              <textarea rows={8} className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm" value={exampleCode} onChange={(e) => setExampleCode(e.target.value)} />
            </FormRow>
          </CardContent>
          <CardFooter className="justify-end">
            <Button size="sm" onClick={() => submit("example", { title: exampleTitle, description: exampleDesc, code: exampleCode }, () => { setExampleTitle(""); setExampleDesc(""); setExampleCode("ye a = 1\nbol a"); })}>Submit & Test</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Propose a patch</CardTitle>
            <CardDescription>Paste a small patch or suggested file changes</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="text-sm">Title</label>
            <Input value={patchTitle} onChange={(e) => setPatchTitle(e.target.value)} placeholder="Patch summary" />
            <FormRow>
              <label className="text-sm">Description</label>
              <textarea rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={patchDesc} onChange={(e) => setPatchDesc(e.target.value)} placeholder="What does the change do?" />
            </FormRow>
            <FormRow>
              <label className="text-sm">Patch or code</label>
              <textarea rows={8} className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm" value={patchCode} onChange={(e) => setPatchCode(e.target.value)} placeholder="Unified diff or code snippet" />
            </FormRow>
          </CardContent>
          <CardFooter className="justify-end">
            <Button size="sm" onClick={() => submit("patch", { title: patchTitle, description: patchDesc, code: patchCode }, () => { setPatchTitle(""); setPatchDesc(""); setPatchCode(""); })}>Submit</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-3">Read docs</h2>
        <p className="text-sm text-muted-foreground mb-4">For design notes, language reference and IDE instructions, check the docs.</p>
        <div className="flex gap-3">
          <Link href="/docs">
            <Button variant="ghost">READ DOCS</Button>
          </Link>
          <Link href="/contribute/get-started">
            <Button>Get started with development</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
