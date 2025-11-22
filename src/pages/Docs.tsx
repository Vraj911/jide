import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Book, Code, Zap, Lightbulb } from "lucide-react";

export default function Docs() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gradient">Documentation</h1>
              <p className="text-xl text-muted-foreground">
                Learn how to use J++ IDE and master the J++ language
              </p>
            </div>

            {/* Getting Started */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Book className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">Getting Started</h2>
              </div>
              
              <Card className="p-6 space-y-4 bg-card/50">
                <h3 className="text-xl font-semibold">Introduction</h3>
                <p className="text-muted-foreground">
                  J++ is a lightweight educational language built on top of JavaScript. 
                  It's designed to make programming more accessible while maintaining the 
                  power and flexibility of JavaScript.
                </p>
              </Card>

              <Card className="p-6 space-y-4 bg-card/50">
                <h3 className="text-xl font-semibold">Hello World</h3>
                <p className="text-muted-foreground">
                  Your first J++ program is simple:
                </p>
                <pre className="bg-editor-bg text-editor-fg p-4 rounded-lg overflow-x-auto">
                  <code className="text-code-keyword">print</code>
                  <code className="text-code-string"> "Hello, World!"</code>
                </pre>
              </Card>
            </section>

            {/* Language Basics */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Code className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">Language Reference</h2>
              </div>

              <Card className="p-6 space-y-4 bg-card/50">
                <h3 className="text-xl font-semibold">Variables</h3>
                <p className="text-muted-foreground">
                  Declare variables using the <code className="text-code-keyword">var</code> keyword:
                </p>
                <pre className="bg-editor-bg text-editor-fg p-4 rounded-lg overflow-x-auto">
                  <code className="text-code-keyword">var</code>
                  <code> x = </code>
                  <code className="text-code-number">42</code>
                  {"\n"}
                  <code className="text-code-keyword">var</code>
                  <code> name = </code>
                  <code className="text-code-string">"John"</code>
                </pre>
              </Card>

              <Card className="p-6 space-y-4 bg-card/50">
                <h3 className="text-xl font-semibold">Functions</h3>
                <p className="text-muted-foreground">
                  Define functions using the <code className="text-code-keyword">func</code> keyword:
                </p>
                <pre className="bg-editor-bg text-editor-fg p-4 rounded-lg overflow-x-auto">
                  <code className="text-code-keyword">func</code>
                  <code> greet(name) {"{"}</code>
                  {"\n  "}
                  <code className="text-code-keyword">print</code>
                  <code className="text-code-string"> "Hello, "</code>
                  <code> + name</code>
                  {"\n"}
                  <code>{"}"}</code>
                </pre>
              </Card>

              <Card className="p-6 space-y-4 bg-card/50">
                <h3 className="text-xl font-semibold">Output</h3>
                <p className="text-muted-foreground">
                  Display output using the <code className="text-code-keyword">print</code> statement:
                </p>
                <pre className="bg-editor-bg text-editor-fg p-4 rounded-lg overflow-x-auto">
                  <code className="text-code-keyword">print</code>
                  <code className="text-code-string"> "Hello!"</code>
                  {"\n"}
                  <code className="text-code-keyword">print</code>
                  <code> x</code>
                </pre>
              </Card>
            </section>

            {/* Compiler Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">How Compilation Works</h2>
              </div>

              <Card className="p-6 space-y-4 bg-card/50">
                <p className="text-muted-foreground">
                  J++ code is parsed and transformed into JavaScript in real-time. 
                  The compilation process involves:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Tokenizing your J++ source code</li>
                  <li>Transforming J++ syntax to JavaScript equivalents</li>
                  <li>Validating syntax and reporting errors</li>
                  <li>Executing the compiled JavaScript safely in your browser</li>
                </ol>
              </Card>
            </section>

            {/* IDE Guide */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Lightbulb className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">Using the IDE</h2>
              </div>

              <Card className="p-6 space-y-4 bg-card/50">
                <h3 className="text-xl font-semibold">Editor Panels</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Source Code:</strong> Write your J++ code here</li>
                  <li><strong>Compiled JavaScript:</strong> See the generated JavaScript</li>
                  <li><strong>Output:</strong> View program execution results</li>
                  <li><strong>Problems:</strong> Check for compilation and runtime errors</li>
                </ul>
              </Card>

              <Card className="p-6 space-y-4 bg-card/50">
                <h3 className="text-xl font-semibold">Keyboard Shortcuts</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><kbd className="px-2 py-1 bg-muted rounded text-sm">Ctrl/Cmd + S</kbd> - Save (coming soon)</li>
                  <li><kbd className="px-2 py-1 bg-muted rounded text-sm">Ctrl/Cmd + Enter</kbd> - Run code (coming soon)</li>
                  <li><kbd className="px-2 py-1 bg-muted rounded text-sm">Ctrl/Cmd + /</kbd> - Toggle comment</li>
                </ul>
              </Card>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
