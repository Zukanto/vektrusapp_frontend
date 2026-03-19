import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDisplayName(user: any, userProfile?: any): string {
  if (!user && !userProfile) return 'User';

  return (
    userProfile?.first_name ||
    user?.profile?.first_name ||
    user?.first_name ||
    user?.email?.split('@')[0] ||
    'User'
  );
}