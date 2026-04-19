/** Roles allowed to use the admin dashboard (step 15). */
export const ADMIN_DASHBOARD_ROLES = new Set([
  "SUPER_ADMIN",
  "ADMIN",
  "INSTITUTION_ADMIN",
  "TEACHER",
]);

export function canAccessAdmin(role: string | undefined) {
  return !!role && ADMIN_DASHBOARD_ROLES.has(role);
}
