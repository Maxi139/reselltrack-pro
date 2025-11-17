import { toast } from 'sonner';

export const getDemoRestrictionMessage = (action: string) =>
  `Demo mode: ${action} is disabled. Upgrade to manage your real data.`;

export const notifyDemoRestriction = (action: string) => {
  toast.info(getDemoRestrictionMessage(action));
};
