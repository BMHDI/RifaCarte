import { UserProfile } from '@/types/types';

export function updateProfileFromMessage(profile: UserProfile, message: string): UserProfile {
  const text = message.toLowerCase();
  const updated = { ...profile };

  // intent
  if (text.includes('travail') || text.includes('emploi') || text.includes('job')) {
    updated.intent = 'emploi';
  }

  // city
  if (text.includes('calgary')) updated.city = 'Calgary';
  if (text.includes('edmonton')) updated.city = 'Edmonton';

  // profession
  if (text.includes('web developer') || text.includes('développeur web')) {
    updated.profession = 'Web Developer';
  }

  // experience
  const expMatch = text.match(/(\d+)\s*ans/);
  if (expMatch) updated.experienceYears = Number(expMatch[1]);

  // urgency
  if (text.includes('immédiat') || text.includes('maintenant')) {
    updated.urgency = 'immediate';
  }

  // company type
  if (text.includes('grand')) updated.companyType = 'large';
  if (text.includes('startup')) updated.companyType = 'startup';

  return updated;
}
