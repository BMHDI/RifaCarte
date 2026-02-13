type Profile = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: string;
  address?: string;
  organization?: string;
  organizationEmail?: string;
};

const sessions = new Map<string, Profile>();

export function getProfile(id: string): Profile {
  return sessions.get(id) || {};
}

export function updateProfile(id: string, data: Partial<Profile>) {
  const current = getProfile(id);

  sessions.set(id, {
    ...current,
    ...data,
  });
}

export function clearProfile(id: string) {
  sessions.delete(id);
}

export function isComplete(profile: Profile) {
  return Boolean(
    profile.firstName &&
    profile.lastName &&
    profile.email &&
    profile.phone &&
    profile.status &&
    profile.address
  );
}
