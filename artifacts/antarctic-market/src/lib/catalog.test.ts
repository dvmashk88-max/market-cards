import assert from "node:assert/strict";
import test from "node:test";

import { shouldRetryStorefrontQuery } from "./catalog";

test("storefront queries retry one transient failure", () => {
  assert.equal(
    shouldRetryStorefrontQuery(0, new TypeError("network failed")),
    true,
  );
  assert.equal(
    shouldRetryStorefrontQuery(1, new TypeError("network failed")),
    false,
  );
});

test("storefront queries do not retry aborts, timeouts, or client errors", () => {
  assert.equal(
    shouldRetryStorefrontQuery(0, new DOMException("aborted", "AbortError")),
    false,
  );
  assert.equal(
    shouldRetryStorefrontQuery(
      0,
      new DOMException("timed out", "TimeoutError"),
    ),
    false,
  );
  assert.equal(shouldRetryStorefrontQuery(0, { status: 400 }), false);
  assert.equal(shouldRetryStorefrontQuery(0, { status: 503 }), true);
});
