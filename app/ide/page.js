"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Editor } from "@/components/Editor";
import { Header } from "@/components/Header";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Play, Settings, AlertCircle, CheckCircle2, FileCode, Terminal as TerminalIcon } from "lucide-react";

const DEFAULT_CODE = `ye x = 10
ye y = 20
ye sum = x + y
bol sum

agar x < y {
  bol "x is smaller"
} nahi {
  bol "x is larger"
}

jabtak x < 15 {
  bol x
  x = x + 1
}`;

export default function IDE() {
  const [sourceCode, setSourceCode] = useState(DEFAULT_CODE);
  const [compiledCode, setCompiledCode] = useState("");
  const [output, setOutput] = useState("");
  const [errors, setErrors] = useState([]);
  const [isCompiling, setIsCompiling] = useState(false);

  const handleCompileAndRun = () => {
    setIsCompiling(true);
    setErrors([]);
    setCompiledCode("");
    setOutput("");

    // Small delay to show loading state
    setTimeout(() => {
      // TODO: Connect compiler here when ready
      setCompiledCode("// Compiler will be connected here");
      setOutput("// Output will appear here when compiler is connected");
      setIsCompiling(false);
    }, 300);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      
      {/* Top Bar */}
      <div className="h-12 border-b border-border/50 flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm mt-16">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">main.jpp</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleCompileAndRun} 
            disabled={isCompiling}
            className="glow-primary"
          >
            <Play className="h-4 w-4 mr-2" />
            {isCompiling ? "Compiling..." : "Compile & Run"}
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main IDE Area */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Source Editor */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col bg-editor-bg">
              <div className="h-10 border-b border-panel-border px-4 flex items-center text-sm font-medium text-editor-fg">
                Source Code
              </div>
              <div className="flex-1">
                <Editor value={sourceCode} onChange={setSourceCode} />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />

          {/* Right Panels */}
          <Panel defaultSize={50} minSize={30}>
            <PanelGroup direction="vertical">
              {/* Compiled JavaScript */}
              <Panel defaultSize={33} minSize={20}>
                <div className="h-full flex flex-col bg-panel-bg">
                  <div className="h-10 border-b border-panel-border px-4 flex items-center text-sm font-medium text-editor-fg">
                    Compiled JavaScript
                  </div>
                  <div className="flex-1">
                    <Editor 
                      value={compiledCode || "// Compiled code will appear here"} 
                      onChange={() => {}} 
                      readOnly 
                      language="javascript"
                    />
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="h-1 bg-border hover:bg-primary transition-colors" />

              {/* Output Panel */}
              <Panel defaultSize={33} minSize={15}>
                <div className="h-full flex flex-col bg-terminal-bg">
                  <div className="h-10 border-b border-panel-border px-4 flex items-center gap-2 text-sm font-medium">
                    <TerminalIcon className="h-4 w-4 text-terminal-fg" />
                    <span className="text-terminal-fg">Output</span>
                  </div>
                  <div className="flex-1 overflow-auto p-4">
                    <pre className="text-terminal-fg text-sm whitespace-pre-wrap font-mono">
                      {output || "Program output will appear here..."}
                    </pre>
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="h-1 bg-border hover:bg-primary transition-colors" />

              {/* Problems Panel */}
              <Panel defaultSize={34} minSize={15}>
                <div className="h-full flex flex-col bg-panel-bg">
                  <div className="h-10 border-b border-panel-border px-4 flex items-center gap-2 text-sm font-medium text-editor-fg">
                    {errors.length > 0 ? (
                      <>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span>Problems ({errors.length})</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-terminal-fg" />
                        <span>Problems (0)</span>
                      </>
                    )}
                  </div>
                  <div className="flex-1 overflow-auto">
                    {errors.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground">
                        No problems detected
                      </div>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {errors.map((error, index) => (
                          <div key={index} className="p-4 hover:bg-card/50 cursor-pointer transition-colors">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-destructive">
                                  {error.message}
                                </div>
                                {error.line && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Line {error.line}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
