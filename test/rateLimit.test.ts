import test from "node:test";
import assert from "node:assert/strict";
import { createRateLimiter, clearRateLimitStore } from "../src/middlewares/rateLimit";

const createMockResponse = () => {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return response;
};

test("rate limiter allows requests within the limit", () => {
  clearRateLimitStore();
  const limiter = createRateLimiter({ windowMs: 60_000, max: 2, keyPrefix: "test" });
  const req = { ip: "127.0.0.1" } as any;
  const res = createMockResponse() as any;

  let nextCalls = 0;
  const next = () => {
    nextCalls += 1;
  };

  limiter(req, res, next);
  limiter(req, res, next);

  assert.equal(nextCalls, 2);
  assert.equal(res.statusCode, 200);
});

test("rate limiter blocks requests after the limit", () => {
  clearRateLimitStore();
  const limiter = createRateLimiter({ windowMs: 60_000, max: 1, keyPrefix: "test" });
  const req = { ip: "127.0.0.1" } as any;
  const res = createMockResponse() as any;

  let nextCalls = 0;
  const next = () => {
    nextCalls += 1;
  };

  limiter(req, res, next);
  limiter(req, res, next);

  assert.equal(nextCalls, 1);
  assert.equal(res.statusCode, 429);
  assert.deepEqual(res.body, { error: "Too many requests, please try again later" });
});