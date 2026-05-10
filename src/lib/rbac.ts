export type AccessRole = "admin" | "member";

export function isGlobalAdmin(role: string | null | undefined): role is "admin" {
  return role === "admin";
}

export function canManageProject(
  globalRole: string | null | undefined,
  projectRole: AccessRole | null | undefined,
) {
  return isGlobalAdmin(globalRole) || projectRole === "admin";
}

export function canAccessProject(
  globalRole: string | null | undefined,
  hasProjectMembership: boolean,
) {
  return isGlobalAdmin(globalRole) || hasProjectMembership;
}

export function canUpdateTaskStatus(
  globalRole: string | null | undefined,
  projectRole: AccessRole | null | undefined,
  assigneeId: string | null | undefined,
  userId: string,
) {
  return isGlobalAdmin(globalRole) || projectRole === "admin" || assigneeId === userId;
}
