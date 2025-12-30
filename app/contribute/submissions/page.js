"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function SubmissionsPage() {
  const [items, setItems] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/contributions").then((r) => r.json()).then((j) => { if (j && j.items) setItems(j.items); }).catch(() => {});
  }, []);

  async function view(name) {
    try {
      const res = await fetch(`/api/contributions/${name}`);
      const j = await res.json();
      toast({ title: `View ${name}`, description: JSON.stringify(j, null, 2) });
    } catch (err) {
      toast({ title: "Failed to fetch", description: String(err) });
    }
  }

  return (
    <main className="container mx-auto px-4 py-24">
      <h1 className="text-3xl font-semibold mb-6">Contributions</h1>
      <p className="text-sm text-muted-foreground mb-6">Recent submissions from contributors via the site.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.length === 0 && <Card><CardContent className="p-6">No submissions yet.</CardContent></Card>}
        {items.map((it) => (
          <Card key={it.name}>
            <CardHeader>
              <CardTitle className="truncate">{it.name}</CardTitle>
              <CardDescription>{new Date(it.modified).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button size="sm" variant="ghost" onClick={() => view(it.name)}>View</Button>
                <a className="inline-block" href={`/api/contributions/${it.name}`} target="_blank" rel="noreferrer">
                  <Button size="sm">Open JSON</Button>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6">
        <Link href="/contribute">
          <Button variant="ghost">Back to Contribute</Button>
        </Link>
      </div>
    </main>
  );
}
