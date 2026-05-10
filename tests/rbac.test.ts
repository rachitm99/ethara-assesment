import assert from "node:assert/strict";
import test from "node:test";

import { canAccessProject, canManageProject, isGlobalAdmin } from "../src/lib/rbac";

test("isGlobalAdmin recognizes admin only", () => {
  assert.equal(isGlobalAdmin("admin"), true);
  assert.equal(isGlobalAdmin("member"), false);
  assert.equal(isGlobalAdmin(undefined), false);
});

test("canManageProject allows global admins and project admins", () => {
  assert.equal(canManageProject("admin", "member"), true);
  assert.equal(canManageProject("member", "admin"), true);
  assert.equal(canManageProject("member", "member"), false);
  assert.equal(canManageProject(undefined, undefined), false);
});

test("canAccessProject allows global admins or members", () => {
  assert.equal(canAccessProject("admin", false), true);
  assert.equal(canAccessProject("member", true), true);
  assert.equal(canAccessProject("member", false), false);
});
