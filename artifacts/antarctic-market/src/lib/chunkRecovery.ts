import { lazy, type ComponentType, type LazyExoticComponent } from "react";

const RELOAD_KEY = "marketcode:stale-chunk-reload";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function isChunkImportError(error: unknown): boolean {
  const message =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return /ChunkLoadError|dynamically imported module|module script|importing a module|TypeError: Load failed/i.test(
    message,
  );
}

export function currentEntryVersion(documentRef: Document = document): string {
  const entry = documentRef.querySelector<HTMLScriptElement>(
    'script[type="module"][src*="/assets/index-"]',
  );
  return entry?.src ?? "unknown-entry";
}

export function recoverStaleChunk(options: {
  error: unknown;
  storage: StorageLike;
  entryVersion: string;
  pathname: string;
  reload: () => void;
}): boolean {
  if (!isChunkImportError(options.error)) return false;
  const marker = `${options.entryVersion}:${options.pathname}`;
  try {
    if (options.storage.getItem(RELOAD_KEY) === marker) return false;
    options.storage.setItem(RELOAD_KEY, marker);
  } catch {
    return false;
  }
  options.reload();
  return true;
}

export function lazyRoute<T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await importer();
    } catch (error) {
      if (
        typeof window !== "undefined" &&
        recoverStaleChunk({
          error,
          storage: window.sessionStorage,
          entryVersion: currentEntryVersion(),
          pathname: window.location.pathname,
          reload: () => window.location.reload(),
        })
      ) {
        return await new Promise<never>(() => undefined);
      }
      throw error;
    }
  });
}
