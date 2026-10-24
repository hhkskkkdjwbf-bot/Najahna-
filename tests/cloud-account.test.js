import test from "node:test";
import assert from "node:assert/strict";
import { cloudAccountConfigured } from "../src/utils/cloud-account.js";

test("cloud authentication stays disabled until a valid public Supabase config is provided", () => {
  assert.equal(cloudAccountConfigured(), false);
});
