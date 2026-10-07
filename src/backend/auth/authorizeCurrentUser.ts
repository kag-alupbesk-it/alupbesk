import { getAuthenticatedProfile } from "./getAuthenticatedProfile";
import { roleCanAccess } from "./roles";

export async function authorizeCurrentUser(pathname: string, method: string) {
  const profile = await getAuthenticatedProfile();
  if (!profile) return { profile: null, status: 401 as const };
  if (!roleCanAccess(profile.role, pathname, method)) {
    return { profile: null, status: 403 as const };
  }
  return { profile, status: 200 as const };
}
