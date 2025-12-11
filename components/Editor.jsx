"use client";

import { useEffect, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import { jppLanguageConfig, jppMonarchTokens, jppTheme } from "@/lib/monacoConfig";

export function Editor({ value, onChange, readOnly = false, language = "jpp" }) {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Register J++ language only if it hasn't been registered
    if (!monaco.languages.getLanguages().some((lang) => lang.id === 'jpp')) {
      monaco.languages.register(jppLanguageConfig);
      monaco.languages.setMonarchTokensProvider('jpp', jppMonarchTokens);
      monaco.editor.defineTheme('jpp-dark', jppTheme);
    }

    // Apply theme
    monaco.editor.setTheme('jpp-dark');
  };

  return (
    <MonacoEditor
      height="100%"
      language={language}
      value={value}
      onChange={(value) => onChange(value || "")}
      onMount={handleEditorDidMount}
      options={{
        readOnly,
        minimap: { enabled: !readOnly },
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: "on",
        theme: "jpp-dark",
      }}
    />
  );
}
