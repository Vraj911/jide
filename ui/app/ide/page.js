"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  AlertCircle,
  CheckCircle2,
  Code2,
  FileCode,
  ListX,
  Play,
  Settings as SettingsIcon,
  Terminal as TerminalIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Editor } from "@/components/Editor";
import { Header } from "@/components/Header";
import { Settings } from "@/components/Settings";
import { ThreeBackground } from "@/components/ThreeBackground";

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

const ENABLE_LSP = process.env.NEXT_PUBLIC_ENABLE_LSP === "true";

export default function IDE() {
  const { theme: appTheme, setTheme: setAppTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sourceCode, setSourceCode] = useState(DEFAULT_CODE);
  const [compiledCode, setCompiledCode] = useState("");
  const [output, setOutput] = useState("");
  const [errors, setErrors] = useState([]);
  const [lspStatus, setLspStatus] = useState(ENABLE_LSP ? "connecting" : "disabled");
  const [diagnostics, setDiagnostics] = useState([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [mobileTab, setMobileTab] = useState("source");
  const [settings, setSettings] = useState({
    theme: "dark",
    fontSize: 14,
    wordWrap: true,
    minimap: true,
    clearOutput: false,
    autoRun: false,
    showCompiled: true,
    showProblems: true,
  });

  useEffect(() => {
    setMounted(true);
    if (appTheme) {
      setSettings((prev) => ({ ...prev, theme: appTheme }));
    }
  }, [appTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);
    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  const handleThemeChange = (newTheme) => {
    setSettings((prev) => ({ ...prev, theme: newTheme }));
    setAppTheme(newTheme);
  };

  const handleCompileAndRun = async () => {
    setIsCompiling(true);
    if (settings.clearOutput) {
      setErrors([]);
      setCompiledCode("");
      setOutput("");
    }

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: sourceCode }),
      });

      const result = await response.json();

      if (result.success) {
        setCompiledCode(result.code || "");
        setOutput(result.output || "");
        setErrors(result.errors || []);
      } else {
        setCompiledCode(result.code || "");
        setOutput(result.output || "");
        setErrors(
          result.errors || [
            {
              message: "Compilation or execution failed",
              type: "error",
            },
          ],
        );
      }
    } catch (error) {
      setErrors([
        {
          message: error instanceof Error ? error.message : "Failed to execute code",
          type: "error",
        },
      ]);
      setOutput("");
      setCompiledCode("");
    } finally {
      setIsCompiling(false);
    }
  };

  if (!mounted) {
    return null;
  }

  const panelCount = diagnostics.length + errors.length;
  const lspLabel =
    lspStatus === "connected"
      ? "LSP connected"
      : lspStatus === "error"
        ? "LSP error"
        : lspStatus === "disabled"
          ? "LSP disabled"
          : "Connecting...";

  const panelTabs = [
    { id: "source", label: "Source", icon: FileCode },
    ...(settings.showCompiled ? [{ id: "compiled", label: "Compiled", icon: Code2 }] : []),
    { id: "output", label: "Output", icon: TerminalIcon },
    ...(settings.showProblems
      ? [{ id: "problems", label: `Problems${panelCount ? ` (${panelCount})` : ""}`, icon: ListX }]
      : []),
  ];

  const problemsPanel = (
    <div className="flex h-full flex-col bg-panel-bg">
      <div className="flex h-10 items-center gap-2 border-b border-panel-border px-4 text-sm font-medium text-editor-fg">
        {panelCount > 0 ? (
          <>
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span>Problems ({panelCount})</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4 text-terminal-fg" />
            <span>Problems (0)</span>
          </>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        {diagnostics.length === 0 && errors.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No problems detected.</div>
        ) : (
          <div className="divide-y divide-border/50">
            {diagnostics.map((diag, index) => (
              <div key={`diag-${index}`} className="p-4 transition-colors hover:bg-card/50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-destructive">{diag.message}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Line {diag.line}, Col {diag.col}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {errors.map((error, index) => (
              <div key={index} className="cursor-pointer p-4 transition-colors hover:bg-card/50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-destructive">{error.message}</div>
                    {error.line && <div className="mt-1 text-xs text-muted-foreground">Line {error.line}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const sourcePanel = (
    <div className="flex h-full flex-col bg-editor-bg">
      <div className="flex h-10 items-center border-b border-panel-border px-4 text-sm font-medium text-editor-fg">
        <span>Source Code</span>
      </div>
      <div className="flex-1">
        <Editor
          value={sourceCode}
          onChange={setSourceCode}
          theme={settings.theme}
          fontSize={settings.fontSize}
          wordWrap={settings.wordWrap ? "on" : "off"}
          minimap={isMobile ? false : settings.minimap}
          onLspStatusChange={setLspStatus}
          onDiagnosticsChange={setDiagnostics}
        />
      </div>
    </div>
  );

  const compiledPanel = (
    <div className="flex h-full flex-col bg-panel-bg">
      <div className="flex h-10 items-center border-b border-panel-border px-4 text-sm font-medium text-editor-fg">
        Compiled JavaScript
      </div>
      <div className="flex-1">
        <Editor
          value={compiledCode || "// Compiled code will appear here"}
          onChange={() => {}}
          readOnly
          language="javascript"
          theme={settings.theme}
          fontSize={settings.fontSize}
          wordWrap={settings.wordWrap ? "on" : "off"}
          minimap={false}
        />
      </div>
    </div>
  );

  const outputPanel = (
    <div className="flex h-full flex-col bg-terminal-bg">
      <div className="flex h-10 items-center gap-2 border-b border-panel-border px-4 text-sm font-medium">
        <TerminalIcon className="h-4 w-4 text-terminal-fg" />
        <span className="text-terminal-fg">Output</span>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="whitespace-pre-wrap break-words font-mono text-sm text-terminal-fg">
          {output || "Program output will appear here..."}
        </pre>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      <ThreeBackground variant="particles" />
      <Header />
      <div className="mt-16 flex min-h-12 flex-col gap-3 border-b border-border/50 bg-card/50 px-4 py-3 backdrop-blur-sm md:h-12 md:flex-row md:items-center md:justify-between md:py-0">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">main.jpp</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleCompileAndRun} disabled={isCompiling} className="w-full glow-primary sm:w-auto">
            <Play className="mr-2 h-4 w-4" />
            {isCompiling ? "Compiling..." : "Compile & Run"}
          </Button>
          <span
            className="text-xs"
            style={{
              color:
                lspStatus === "connected"
                  ? "#4ec9b0"
                  : lspStatus === "error"
                    ? "#f44747"
                    : "#858585",
            }}
          >
            {"\u25cf"} {lspLabel}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
            <SettingsIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {isMobile ? (
          <div className="flex h-full flex-col overflow-hidden">
            <div className="overflow-x-auto border-b border-border/50 bg-card/30 px-4 py-2">
              <div className="flex min-w-max gap-2">
                {panelTabs.map(({ id, label, icon: Icon }) => (
                  <Button
                    key={id}
                    variant={mobileTab === id ? "default" : "outline"}
                    size="sm"
                    className="shrink-0"
                    onClick={() => setMobileTab(id)}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {mobileTab === "source" && sourcePanel}
              {mobileTab === "compiled" && settings.showCompiled && compiledPanel}
              {mobileTab === "output" && outputPanel}
              {mobileTab === "problems" && settings.showProblems && problemsPanel}
            </div>
          </div>
        ) : (
          <PanelGroup direction="horizontal">
            <Panel defaultSize={50} minSize={30}>
              {sourcePanel}
            </Panel>

            <PanelResizeHandle className="w-1 bg-border transition-colors hover:bg-primary" />

            <Panel defaultSize={50} minSize={30}>
              <PanelGroup direction="vertical">
                {settings.showCompiled && (
                  <>
                    <Panel defaultSize={settings.showProblems ? 33 : 50} minSize={20}>
                      {compiledPanel}
                    </Panel>
                    <PanelResizeHandle className="h-1 bg-border transition-colors hover:bg-primary" />
                  </>
                )}

                <Panel
                  defaultSize={settings.showCompiled && settings.showProblems ? 33 : settings.showCompiled || settings.showProblems ? 50 : 100}
                  minSize={15}
                >
                  {outputPanel}
                </Panel>

                {settings.showProblems && (
                  <>
                    <PanelResizeHandle className="h-1 bg-border transition-colors hover:bg-primary" />
                    <Panel defaultSize={settings.showCompiled ? 34 : 50} minSize={15}>
                      {problemsPanel}
                    </Panel>
                  </>
                )}
              </PanelGroup>
            </Panel>
          </PanelGroup>
        )}
      </div>

      <Settings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSettingsChange={setSettings}
        onThemeChange={handleThemeChange}
      />
    </div>
  );
}
