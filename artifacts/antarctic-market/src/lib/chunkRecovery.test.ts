import assert from "node:assert/strict";
import test from "node:test";

import { isChunkImportError, recoverStaleChunk } from "./chunkRecovery";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
  };
}

test("recognizes stale dynamic import failures", () => {
  assert.equal(
    isChunkImportError(
      new TypeError("Failed to fetch dynamically imported module"),
    ),
    true,
  );
  assert.equal(
    isChunkImportError(new Error("Checkout validation failed")),
    false,
  );
});

test("reloads at most once for the same entry version and path", () => {
  const storage = memoryStorage();
  let reloads = 0;
  const options = {
    error: new TypeError("Importing a module script failed"),
    storage,
    entryVersion: "/assets/index-current.js",
    pathname: "/privacy",
    reload: () => {
      reloads += 1;
    },
  };

  assert.equal(recoverStaleChunk(options), true);
  assert.equal(recoverStaleChunk(options), false);
  assert.equal(reloads, 1);
});

test("allows one recovery after the entry version changes", () => {
  const storage = memoryStorage();
  let reloads = 0;
  const shared = {
    error: new TypeError("Failed to fetch dynamically imported module"),
    storage,
    pathname: "/steam",
    reload: () => {
      reloads += 1;
    },
  };

  assert.equal(recoverStaleChunk({ ...shared, entryVersion: "old" }), true);
  assert.equal(recoverStaleChunk({ ...shared, entryVersion: "new" }), true);
  assert.equal(reloads, 2);
});
