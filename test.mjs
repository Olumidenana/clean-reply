import test from "node:test";
import assert from "node:assert/strict";
import { cleanReply } from "./index.mjs";

test("cleanReply strips quote and signature", () => {
  const input = `Approved!\n\nBest,\nJohn\n\nOn Nov 3, wrote:\n> Hello`;
  const res = cleanReply(input);
  assert.equal(res.clean, "Approved!");
  assert.equal(res.signature, "Best,\nJohn");
  assert.ok(res.quoted.includes("Hello"));
});
