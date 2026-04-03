import test from "node:test";
import assert from "node:assert/strict";
import { recordQuerySchema } from "../src/schemas/recordSchemas";

test("record query schema supports search and pagination defaults", () => {
  const result = recordQuerySchema.parse({ search: "rent" });

  assert.equal(result.search, "rent");
  assert.equal(result.page, 1);
  assert.equal(result.pageSize, 20);
});

test("record query schema rejects empty search values", () => {
  assert.throws(() => recordQuerySchema.parse({ search: "   " }));
});