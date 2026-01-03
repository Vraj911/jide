"use client";
import { useEffect, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import {
  jppLanguageConfig,
  jppMonarchTokens,
  jppTheme,
  jppLightTheme
} from "@/lib/monacoConfig";

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
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
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

  return (
    <MonacoEditor
      height="100%"
      language={language}
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
