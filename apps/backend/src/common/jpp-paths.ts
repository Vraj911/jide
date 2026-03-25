import path from 'node:path';
import fs from 'node:fs';

function exists(p: string) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

export function resolveJppCompilerPath(): string {
  const candidates = [
    path.resolve(process.cwd(), 'lib/jpp/compiler.js'),
    path.resolve(__dirname, '../../../../lib/jpp/compiler.js'),
    path.resolve(__dirname, '../../../../../lib/jpp/compiler.js'),
  ];

  const hit = candidates.find(exists);
  if (!hit) {
    throw new Error('Cannot resolve lib/jpp/compiler.js');
  }
  return hit;
}

export function resolveJppLspPath(): string {
  const candidates = [
    path.resolve(process.cwd(), 'lib/jpp/lsp.js'),
    path.resolve(__dirname, '../../../../lib/jpp/lsp.js'),
    path.resolve(__dirname, '../../../../../lib/jpp/lsp.js'),
  ];

  const hit = candidates.find(exists);
  if (!hit) {
    throw new Error('Cannot resolve lib/jpp/lsp.js');
  }
  return hit;
}
