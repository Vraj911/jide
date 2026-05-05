export const JPP_LANGUAGE_ID = "jpp";

const LSP_WS_URL = process.env.NEXT_PUBLIC_LSP_WS_URL || "ws://localhost:3001";

let client = null;
let websocket = null;
let servicesReady = false;
let servicesPromise = null;

async function ensureServices() {
  if (typeof window === "undefined") {
    return false;
  }

  if (servicesReady) {
    return true;
  }

  if (!servicesPromise) {
    servicesPromise = import("monaco-languageclient/vscode/services")
      .then(async ({ initServices }) => {
        await initServices({});
        servicesReady = true;
        return true;
      })
      .catch((error) => {
        servicesPromise = null;
        throw error;
      });
  }

  return servicesPromise;
}

export async function registerJppLanguage() {
  return ensureServices();
}

export async function connectToLSP(documentUri, onStatusChange, monaco) {
  if (typeof window === "undefined") {
    return () => {};
  }

  if (!monaco) {
    throw new Error("[J++ LSP] Monaco instance is required");
  }

  if (client || websocket) {
    return () => {};
  }

  await ensureServices();

  const [
    { MonacoLanguageClient },
    { toSocket, WebSocketMessageReader, WebSocketMessageWriter },
    { CloseAction, ErrorAction },
  ] = await Promise.all([
    import("monaco-languageclient"),
    import("vscode-ws-jsonrpc"),
    import("vscode-languageclient/browser"),
  ]);

  onStatusChange?.("connecting");

  websocket = new WebSocket(LSP_WS_URL);

  const cleanup = async () => {
    const activeClient = client;
    client = null;

    if (activeClient) {
      await activeClient.stop();
    }

    if (websocket) {
      websocket.close();
      websocket = null;
    }
  };

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
          closed: () => ({ action: CloseAction.Restart }),
        },
        workspaceFolder: {
          uri: monaco.Uri.parse("file:///workspace"),
          name: "J++ Workspace",
          index: 0,
        },
      },
      messageTransports: { reader, writer },
    });

    client.start();
    console.log("[J++ LSP] Language client started for", documentUri);
  };

  websocket.onerror = (error) => {
    onStatusChange?.("error");
    console.error("[J++ LSP] WebSocket error:", error);
  };

  websocket.onclose = async () => {
    const activeClient = client;
    client = null;
    websocket = null;

    if (activeClient) {
      await activeClient.stop();
    }
  };

  return cleanup;
}
