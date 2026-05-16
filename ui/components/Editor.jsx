"use client";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  jppLanguageConfig,
  jppMonarchTokens,
  jppTheme,
  jppLightTheme
} from "@/lib/monacoConfig";

const JPP_LANGUAGE_ID = "jpp";

const ENABLE_LSP = process.env.NEXT_PUBLIC_ENABLE_LSP === "true";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

let themesRegistered = false;

export function Editor({
  value,
  onChange,
  readOnly = false,
  language = "jpp",
  theme = "dark",
  fontSize = 14,
  wordWrap = "on",
  minimap = true,
  onLspStatusChange,
  onDiagnosticsChange,
  onEditorReady,
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const lspCleanupRef = useRef(null);
  const markerDisposableRef = useRef(null);
  const lspConnectedRef = useRef(false);
  const lspLanguageRegisteredRef = useRef(false);
  const lspDocumentUriRef = useRef("file:///workspace/main.jpp");
  const contextMenuCleanupRef = useRef(null);

  const handleEditorDidMount = async (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    if (!monaco.languages.getLanguages().some(lang => lang.id === "jpp")) {
      monaco.languages.register(jppLanguageConfig);
      monaco.languages.setMonarchTokensProvider("jpp", jppMonarchTokens);
    }

    if (!themesRegistered) {
      monaco.editor.defineTheme("jpp-dark", jppTheme);
      monaco.editor.defineTheme("jpp-light", jppLightTheme);
      themesRegistered = true;
    }

    monaco.editor.setTheme(theme === "dark" ? "jpp-dark" : "jpp-light");
    onEditorReady?.({ editor, monaco });

    const editorDomNode = editor.getDomNode();
    if (editorDomNode) {
      const suppressContextMenu = (event) => event.preventDefault();
      editorDomNode.addEventListener("contextmenu", suppressContextMenu);
      contextMenuCleanupRef.current = () => {
        editorDomNode.removeEventListener("contextmenu", suppressContextMenu);
      };
    }

    if (!readOnly && language === JPP_LANGUAGE_ID && !lspConnectedRef.current) {
      if (!ENABLE_LSP) {
        onLspStatusChange?.("disabled");
        return;
      }

      // Load the LSP wiring only for the primary editable J++ editor.
      // This avoids pulling the heavy LSP/VSCode API shim into every editor instance
      // (e.g. read-only compiled JS panes), and lets Next.js compile it lazily.
      let registerJppLanguage;
      let connectToLSP;
      try {
        ({ registerJppLanguage, connectToLSP } = await import("@/lib/lsp/monacoLSPSetup"));
      } catch (error) {
        console.error("[J++ LSP] Failed to load LSP setup:", error);
        onLspStatusChange?.("error");
        return;
      }

      if (!lspLanguageRegisteredRef.current) {
        registerJppLanguage(monaco);
        lspLanguageRegisteredRef.current = true;
      }

      const previousModel = editor.getModel();
      const modelUri = monaco.Uri.parse("file:///workspace/main.jpp");
      let model = monaco.editor.getModel(modelUri);

      if (!model) {
        model = monaco.editor.createModel(editor.getValue(), "jpp", modelUri);
      }

      editor.setModel(model);

      if (previousModel && previousModel !== model) {
        previousModel.dispose();
      }

      try {
        lspCleanupRef.current = connectToLSP(monaco, model, onLspStatusChange);
        lspConnectedRef.current = true;
      } catch (error) {
        console.error("[J++ LSP] Failed to connect:", error);
        onLspStatusChange?.("error");
      }

      markerDisposableRef.current = monaco.editor.onDidChangeMarkers(() => {
        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        onDiagnosticsChange?.(
          markers.map((m) => ({
            message: m.message,
            line: m.startLineNumber,
            col: m.startColumn,
            severity:
              m.severity === monaco.MarkerSeverity.Error ? "error" : "warning",
          }))
        );
      });
    }
  };

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(
        theme === "dark" ? "jpp-dark" : "jpp-light"
      );
    }
  }, [theme]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize,
        wordWrap: wordWrap === "on" ? "on" : "off",
        minimap: { enabled: minimap && !readOnly },
      });
    }
  }, [fontSize, wordWrap, minimap, readOnly]);

  useEffect(() => {
    return () => {
      if (markerDisposableRef.current) {
        markerDisposableRef.current.dispose();
        markerDisposableRef.current = null;
      }
      if (contextMenuCleanupRef.current) {
        contextMenuCleanupRef.current();
        contextMenuCleanupRef.current = null;
      }
      if (lspCleanupRef.current) {
        lspCleanupRef.current();
        lspCleanupRef.current = null;
      }
      lspConnectedRef.current = false;
    };
  }, []);

  return (
    <MonacoEditor
      height="100%"
      language={language}
      path={!readOnly && language === JPP_LANGUAGE_ID ? lspDocumentUriRef.current : undefined}
      value={value}
      onChange={value => onChange(value || "")}
      onMount={handleEditorDidMount}
      options={{
        readOnly,
        fontSize,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: wordWrap === "on" ? "on" : "off",
        minimap: { enabled: minimap && !readOnly },
        contextmenu: false,
        glyphMargin: false,
        codeLens: false,
        folding: false,
        links: false,
      }}
    />
  );
}
