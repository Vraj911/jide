"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThreeBackground } from "@/components/ThreeBackground";
import { Code2, Zap, Layers, ArrowRight, Terminal, Play } from "lucide-react";
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <ThreeBackground variant="particles" />
      <Header />
      <section className="relative overflow-hidden px-4 pb-16 pt-24 sm:pt-28 md:pt-32 md:pb-20">
        <div className="container mx-auto relative z-10">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-6 md:space-y-8">
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Build. Compile.{" "}
                <span className="text-gradient">Run.</span>
                <br />
                In Your Browser.
              </h1>
              <p className="max-w-lg text-base text-muted-foreground sm:text-lg md:text-xl">
                A modern web-based IDE for J++, your custom language built on JavaScript. 
                Write, compile, and execute code instantly with powerful editor features.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link href="/ide">
                  <Button size="lg" className="glow-primary-lg group w-full sm:w-auto">
                    Start Coding
                    <Play className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    View Docs
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="glass-panel space-y-4 overflow-hidden rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Terminal className="h-4 w-4" />
                <span>main.jpp</span>
              </div>
              <pre className="overflow-x-auto text-xs sm:text-sm md:text-base">
                <code className="text-code-keyword">print</code>
                <code className="text-code-string"> "Hello, World!"</code>
                {"\n\n"}
                <code className="text-code-keyword">var</code>
                <code> x = </code>
                <code className="text-code-number">42</code>
                {"\n"}
                <code className="text-code-keyword">print</code>
                <code> x</code>
                {"\n\n"}
                <code className="text-code-keyword">func</code>
                <code> greet(name) {"{"}</code>
                {"\n  "}
                <code className="text-code-keyword">print</code>
                <code className="text-code-string"> "Hello, "</code>
                <code> + name</code>
                {"\n"}
                <code>{"}"}</code>
              </pre>
              <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                <div className="h-2 w-2 rounded-full bg-terminal-fg animate-pulse" />
                <span className="text-sm text-terminal-fg">Output: Hello, World!</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-card/30 px-4 py-16 md:py-20">
        <div className="container mx-auto">
          <h2 className="mb-10 text-center text-3xl font-bold md:mb-12 md:text-4xl">
            Everything You Need to Code
          </h2>   
          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            <Card className="p-6 space-y-4 hover:glow-primary transition-all duration-300 bg-card/50 backdrop-blur">
              <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">VS Code-Style Editor</h3>
              <p className="text-muted-foreground">
                Powered by Monaco Editor with syntax highlighting, IntelliSense, 
                and all the features you love from VS Code.
              </p>
            </Card>
            <Card className="p-6 space-y-4 hover:glow-primary transition-all duration-300 bg-card/50 backdrop-blur">
              <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Instant Compile & Run</h3>
              <p className="text-muted-foreground">
                See your code come to life instantly. Compile J++ to JavaScript 
                and execute it right in your browser with live output.
              </p>
            </Card>
            <Card className="p-6 space-y-4 hover:glow-primary transition-all duration-300 bg-card/50 backdrop-blur">
              <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Custom Language Support</h3>
              <p className="text-muted-foreground">
                Built specifically for J++. Get custom syntax highlighting, 
                error detection, and compiler feedback tailored to your language.
              </p>
            </Card>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
