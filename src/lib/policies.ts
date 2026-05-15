export interface PolicyModel {
  id: string;
  userId: string;
  name: string;
  type?: string;
  provider: string;
  premium: number;
  renewalDate: Date;
  policyNumber?: string;
  coverage?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export function getDaysUntilRenewal(policy: PolicyModel) {
  const now = new Date();
  const daysUntil = Math.ceil(
    (policy.renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntil;
}

export function getPolicyStatus(policy: PolicyModel) {
  const daysUntil = getDaysUntilRenewal(policy);
  if (daysUntil < 0) return 'expired';
  if (daysUntil <= 30) return 'renewing_soon';
  return 'active';
}
