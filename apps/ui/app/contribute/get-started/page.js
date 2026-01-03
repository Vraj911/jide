import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GetStarted() {
  return (
    <main className="container mx-auto px-4 py-24">
      <h1 className="text-4xl font-bold mb-6">Get started contributing</h1>

      <Card>
        <CardHeader>
          <CardTitle>Local setup</CardTitle>
          <CardDescription>How to get the repo and run the dev server locally</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Fork & clone the repo</li>
            <li>Install deps: <code>npm install</code></li>
            <li>Run dev server: <code>npm run dev</code> (open <code>http://localhost:3000</code>)</li>
            <li>Run tests: <code>npm run test:ui</code> and <code>npm run test:api</code></li>
            <li>To run compiler unit tests: <code>node lib/jpp/tests.js</code></li>
          </ol>
          <div className="mt-4 flex gap-3">
            <Link href="/contribute">
              <Button variant="ghost">Back to Contribute</Button>
            </Link>
            <a className="inline-block" href="https://github.com/your-org/jide/issues/new/choose" target="_blank" rel="noreferrer">
              <Button>Open an issue on GitHub</Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
