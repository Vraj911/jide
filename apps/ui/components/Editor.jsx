"use client";
import { useEffect, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import {
  jppLanguageConfig,
  jppMonarchTokens,
  jppTheme,
  jppLightTheme
} from "@/lib/monacoConfig";
import { connectToLSP, JPP_LANGUAGE_ID, registerJppLanguage } from "@/lib/lsp/monacoLSPSetup";

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
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const lspCleanupRef = useRef(null);
  const markerDisposableRef = useRef(null);
  const lspConnectedRef = useRef(false);
  const lspDocumentUriRef = useRef("file:///workspace/main.jpp");

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    registerJppLanguage();
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

    if (!readOnly && language === JPP_LANGUAGE_ID && !lspConnectedRef.current) {
      const model = editor.getModel();
      if (model && model.uri.toString() !== lspDocumentUriRef.current) {
        const replacementModel = monaco.editor.createModel(
          model.getValue(),
          JPP_LANGUAGE_ID,
          monaco.Uri.parse(lspDocumentUriRef.current)
        );
        editor.setModel(replacementModel);
        model.dispose();
      }

      lspCleanupRef.current = connectToLSP(lspDocumentUriRef.current, onLspStatusChange);
      lspConnectedRef.current = true;

      markerDisposableRef.current = monaco.editor.onDidChangeMarkers(() => {
        const activeModel = editor.getModel();
        if (!activeModel || !onDiagnosticsChange) return;
        const markers = monaco.editor.getModelMarkers({ resource: activeModel.uri });
        onDiagnosticsChange(
          markers.map((m) => ({
            message: m.message,
            line: m.startLineNumber,
            col: m.startColumn,
            severity: m.severity === 8 ? "error" : "warning"
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
      }}
    />
  );
}
