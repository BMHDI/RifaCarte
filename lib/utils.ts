import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CATEGORIES from '@/lib/categories';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1));
}

export function getCategoryIdsFromGroups(selectedGroups: string[]): string[] {
  const ids: string[] = [];

  CATEGORIES.forEach((group) => {
    if (selectedGroups.includes(group.group)) {
      group.items.forEach((item) => {
        ids.push(item.id);
      });
    }
  });

  return ids;
}
