import * as monaco from "monaco-editor";
import { MonacoLanguageClient, MonacoServices } from "monaco-languageclient";
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from "vscode-ws-jsonrpc";
import { CloseAction, ErrorAction } from "vscode-languageclient";

export const JPP_LANGUAGE_ID = "jpp";

const LSP_WS_URL = process.env.NEXT_PUBLIC_LSP_WS_URL || "ws://localhost:3001";

let client = null;
let websocket = null;
let monacoServicesInstalled = false;

export function registerJppLanguage() {
  if (!monacoServicesInstalled) {
    MonacoServices.install();
    monacoServicesInstalled = true;
  }
}

export function connectToLSP(documentUri, onStatusChange) {
  if (client || websocket) {
    return () => {};
  }

  onStatusChange?.("connecting");
  websocket = new WebSocket(LSP_WS_URL);

  websocket.onopen = () => {
    onStatusChange?.("connected");
    const socket = toSocket(websocket);
    const reader = new WebSocketMessageReader(socket);
    const writer = new WebSocketMessageWriter(socket);

    client = new MonacoLanguageClient({
      name: "J++ Language Client",
      clientOptions: {
        documentSelector: [{ language: JPP_LANGUAGE_ID }],
        errorHandler: {
          error: () => ({ action: ErrorAction.Continue }),
          closed: () => ({ action: CloseAction.Restart })
        },
        workspaceFolder: {
          uri: monaco.Uri.parse("file:///workspace"),
          name: "J++ Workspace",
          index: 0
        }
      },
      messageTransports: { reader, writer }
    });

    client.start();
    console.log("[J++ LSP] Language client started for", documentUri);
  };

  websocket.onerror = (err) => {
    onStatusChange?.("error");
    console.error("[J++ LSP] WebSocket error:", err);
  };

  websocket.onclose = () => {
    if (client) {
      client.stop();
      client = null;
    }
    websocket = null;
  };

  return () => {
    if (client) {
      client.stop();
      client = null;
    }
    if (websocket) {
      websocket.close();
      websocket = null;
    }
  };
}
