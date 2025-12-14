"use client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { ThreeBackground } from "@/components/ThreeBackground";
import { Book, Code, Zap, Lightbulb } from "lucide-react";
export default function Docs() {
  return (
    <div className="min-h-screen flex flex-col">
      <ThreeBackground variant="particles" />
      <Header />
      <div className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gradient">Documentation</h1>
              <p className="text-xl text-muted-foreground">
                Learn how to use J++ IDE and master the J++ language
              </p>
            </div>
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Book className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">Core Philosophy: Zero Implicit Coercion</h2>
              </div>
              <Card className="p-6 space-y-4 bg-card/50">
                <h3 className="text-xl font-semibold">The Problem</h3>
                <p className="text-muted-foreground">
                  J++ fixes JavaScript's biggest design flaw: <strong>the ambiguous `+` operator</strong>.
                  JavaScript's `+` operator is fundamentally broken due to implicit type coercion, making code unpredictable and error-prone.
                </p>
              </Card>
              <Card className="p-6 space-y-4 bg-card/50">
                <h3 className="text-xl font-semibold">Strict Operator Rules</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground mb-2">
                      <strong>1. `+` operator:</strong> Numeric addition ONLY
                    </p>
                    <pre className="bg-editor-bg text-editor-fg p-4 rounded-lg overflow-x-auto text-sm">
                      <code className="text-code-number">5</code>
                      <code> + </code>
                      <code className="text-code-number">3</code>
                      <code> → </code>
                      <code className="text-code-number">8</code>
                      <code> ✅</code>
                      {"\n"}
                      <code className="text-code-string">"hello"</code>
                      <code> + </code>
                      <code className="text-code-number">5</code>
                      <code> → </code>
                      <code className="text-code-keyword">COMPILE ERROR</code>
                      <code> ❌</code>
                    </pre>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">
                      <strong>2. `.` operator:</strong> String concatenation ONLY
                    </p>
                    <pre className="bg-editor-bg text-editor-fg p-4 rounded-lg overflow-x-auto text-sm">
                      <code className="text-code-string">"hello"</code>
                      <code> . </code>
                      <code className="text-code-string">"world"</code>
                      <code> → </code>
                      <code className="text-code-string">"helloworld"</code>
                      <code> ✅</code>
                      {"\n"}
                      <code className="text-code-number">5</code>
                      <code> . </code>
                      <code className="text-code-string">"hello"</code>
                      <code> → </code>
                      <code className="text-code-keyword">COMPILE ERROR</code>
                      <code> ❌</code>
                    </pre>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">
                      <strong>3. Type Safety:</strong> Variables remember their type
                    </p>
                    <pre className="bg-editor-bg text-editor-fg p-4 rounded-lg overflow-x-auto text-sm">
                      <code className="text-code-keyword">ye</code>
                      <code> x = </code>
                      <code className="text-code-number">5</code>
                      <code> → x is </code>
                      <code className="text-code-keyword">number</code>
                      {"\n"}
                      <code>x = </code>
                      <code className="text-code-string">"hi"</code>
                      <code> → </code>
                      <code className="text-code-keyword">COMPILE ERROR</code>
                      <code> (type mismatch)</code>
                    </pre>
                  </div>
                </div>
              </Card>
            </section>
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Code className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">Example Programs</h2>
              </div>
              <Card className="p-6 space-y-4 bg-card/50">
                <h3 className="text-xl font-semibold">✅ Valid Code</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-muted-foreground mb-2">Numeric addition:</p>
                    <pre className="bg-editor-bg text-editor-fg p-4 rounded-lg overflow-x-auto text-sm">
                      <code className="text-code-keyword">ye</code>
                      <code> a = </code>
                      <code className="text-code-number">5</code>
                      {"\n"}
                      <code className="text-code-keyword">ye</code>
                      <code> b = </code>
                      <code className="text-code-number">10</code>
                      {"\n"}
                      <code className="text-code-keyword">ye</code>
                      <code> sum = a + b</code>
                      {"\n"}
                      <code className="text-code-keyword">bol</code>
                      <code> sum   </code>
                      <code className="text-code-comment">// 15</code>
                    </pre>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">String concatenation:</p>
                    <pre className="bg-editor-bg text-editor-fg p-4 rounded-lg overflow-x-auto text-sm">
                      <code className="text-code-keyword">ye</code>
                      <code> x = </code>
                      <code className="text-code-string">"hello"</code>
                      {"\n"}
                      <code className="text-code-keyword">ye</code>
                      <code> y = </code>
                      <code className="text-code-string">"world"</code>
                      {"\n"}
                      <code className="text-code-keyword">ye</code>
                      <code> z = x . y</code>
                      {"\n"}
                      <code className="text-code-keyword">bol</code>
                      <code> z   </code>
                      <code className="text-code-comment">// "helloworld"</code>
                    </pre>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">Mixed usage:</p>
                    <pre className="bg-editor-bg text-editor-fg p-4 rounded-lg overflow-x-auto text-sm">
                      <code className="text-code-keyword">ye</code>
                      <code> num = </code>
                      <code className="text-code-number">42</code>
                      {"\n"}
                      <code className="text-code-keyword">ye</code>
                      <code> str = </code>
                      <code className="text-code-string">"answer: "</code>
                      {"\n"}
                      <code className="text-code-keyword">bol</code>
                      <code> str . </code>
                      <code className="text-code-string">"42"</code>
                      <code>   </code>
                      <code className="text-code-comment">// "answer: 42"</code>
                    </pre>
                  </div>
                </div>
              </Card>
              <Card className="p-6 space-y-4 bg-card/50">
                <h3 className="text-xl font-semibold">❌ Compile Errors</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-muted-foreground mb-2">Invalid: mixing types with +</p>
                    <pre className="bg-editor-bg text-editor-fg p-4 rounded-lg overflow-x-auto text-sm">
                      <code className="text-code-keyword">ye</code>
                      <code> x = </code>
                      <code className="text-code-number">5</code>
                      {"\n"}
                      <code className="text-code-keyword">ye</code>
                      <code> y = </code>
                      <code className="text-code-string">"10"</code>
                      {"\n"}
                      <code className="text-code-keyword">bol</code>
                      <code> x + y   </code>
                      <code className="text-code-comment">// ERROR: '+' requires numeric operands</code>
                    </pre>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">Invalid: mixing types with .</p>
                    <pre className="bg-editor-bg text-editor-fg p-4 rounded-lg overflow-x-auto text-sm">
                      <code className="text-code-keyword">ye</code>
                      <code> a = </code>
                      <code className="text-code-string">"hello"</code>
                      {"\n"}
                      <code className="text-code-keyword">ye</code>
                      <code> b = </code>
                      <code className="text-code-number">5</code>
                      {"\n"}
                      <code className="text-code-keyword">bol</code>
                      <code> a . b   </code>
                      <code className="text-code-comment">// ERROR: '.' requires string operands</code>
                    </pre>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">Invalid: type reassignment</p>
                    <pre className="bg-editor-bg text-editor-fg p-4 rounded-lg overflow-x-auto text-sm">
                      <code className="text-code-keyword">ye</code>
                      <code> x = </code>
                      <code className="text-code-number">5</code>
                      {"\n"}
                      <code>x = </code>
                      <code className="text-code-string">"hi"</code>
                      <code>    </code>
                      <code className="text-code-comment">// ERROR: Cannot assign string to number variable</code>
                    </pre>
                  </div>
                </div>
              </Card>
            </section>
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">Architecture</h2>
              </div>
              <Card className="p-6 space-y-4 bg-card/50">
                <h3 className="text-xl font-semibold">Compilation Pipeline</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>Source Code</p>
                  <p className="text-center">↓</p>
                  <p>[Lexer] → Tokens (including string literals and . operator)</p>
                  <p className="text-center">↓</p>
                  <p>[Parser] → AST (with ConcatOp nodes for .)</p>
                  <p className="text-center">↓</p>
                  <p>[TypeChecker] → Validated AST (enforces strict types)</p>
                  <p className="text-center">↓</p>
                  <p>[Generator] → JavaScript Code</p>
                </div>
              </Card>
              <Card className="p-6 space-y-4 bg-card/50">
                <h3 className="text-xl font-semibold">Operator Precedence</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Primary: <code className="text-code-keyword">Number</code>, <code className="text-code-keyword">String</code>, <code className="text-code-keyword">Identifier</code>, <code className="text-code-keyword">(Expression)</code></li>
                  <li>Multiplicative: <code className="text-code-keyword">*</code>, <code className="text-code-keyword">/</code></li>
                  <li>Concatenation: <code className="text-code-keyword">.</code> (string-only)</li>
                  <li>Additive: <code className="text-code-keyword">+</code>, <code className="text-code-keyword">-</code> (numeric-only)</li>
                </ol>
              </Card>
              <Card className="p-6 space-y-4 bg-card/50">
                <h3 className="text-xl font-semibold">Type System</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Inferred Types:</strong> Literals determine type
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li><code className="text-code-string">"abc"</code> → <code className="text-code-keyword">string</code></li>
                      <li><code className="text-code-number">123</code> → <code className="text-code-keyword">number</code></li>
                    </ul>
                  </li>
                  <li><strong>Variable Types:</strong> Tracked in symbol table</li>
                  <li><strong>Strict Checking:</strong> No implicit conversions</li>
                </ul>
              </Card>
            </section>
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
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">Implementation Details</h2>
              </div>
              <Card className="p-6 space-y-4 bg-card/50">
                <h3 className="text-xl font-semibold">Key Features Implemented</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Strict `+` Operator:</strong> Only accepts numeric operands with compile-time error for type mismatches</li>
                  <li><strong>Strict `.` Operator:</strong> Only accepts string operands with compile-time error for type mismatches</li>
                  <li><strong>Type System:</strong> Variable type tracking, type inference from literals, type mismatch detection on assignment</li>
                  <li><strong>Zero Runtime Overhead:</strong> All checks happen during compilation</li>
                  <li><strong>Clear Errors:</strong> Actionable error messages</li>
                </ul>
              </Card>
              <Card className="p-6 space-y-4 bg-card/50">
                <h3 className="text-xl font-semibold">Design Decisions</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-muted-foreground mb-2"><strong>Why `.` for Concatenation?</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Visual Clarity: Distinct from `+`</li>
                      <li>Intuitive: Similar to method chaining</li>
                      <li>Future-proof: Leaves room for `..` (range operator)</li>
                      <li>No Conflicts: Doesn't interfere with existing operators</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2"><strong>Type Checking Strategy:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Compile-time: All checks happen during compilation</li>
                      <li>Zero Runtime Overhead: No type checks in generated code</li>
                      <li>Clear Errors: Actionable error messages</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </section>
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Code className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">Compiler Files</h2>
              </div>
              <Card className="p-6 space-y-4 bg-card/50">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><code className="text-code-keyword">lexer.js</code> - Tokenizes source code (handles strings and `.` operator)</li>
                  <li><code className="text-code-keyword">parser.js</code> - Builds AST with proper precedence</li>
                  <li><code className="text-code-keyword">typeChecker.js</code> - Enforces strict type rules</li>
                  <li><code className="text-code-keyword">generator.js</code> - Generates JavaScript code</li>
                  <li><code className="text-code-keyword">compiler.js</code> - Main compilation pipeline</li>
                  <li><code className="text-code-keyword">tests.js</code> - Comprehensive test suite</li>
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
