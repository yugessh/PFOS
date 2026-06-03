/**
 * Family finance helpers and types
 */

export type Role = 'owner' | 'admin' | 'member' | 'viewer';

export interface FamilyMember {
  id: string;
  displayName: string;
  email?: string;
  role: Role;
}

export interface FamilyGroup {
  id?: string;
  name: string;
  ownerId: string;
  members: FamilyMember[];
  createdAt?: Date;
}

export interface SharedAccount {
  id?: string;
  name: string;
  balance: number;
  owners: { memberId: string; percent: number }[];
}

export function computeHouseholdNetWorth(sharedAccounts: SharedAccount[], individualNetWorths: { memberId: string; netWorth: number }[]) {
  const accountsTotal = sharedAccounts.reduce((s, a) => s + (a.balance || 0), 0);
  const individualTotal = individualNetWorths.reduce((s, i) => s + (i.netWorth || 0), 0);
  return { accountsTotal, individualTotal, householdNetWorth: accountsTotal + individualTotal };
}

export function splitExpenseEqual(amount: number, membersCount: number) {
  const per = Math.round((amount / Math.max(1, membersCount)) * 100) / 100;
  return Array.from({ length: membersCount }, () => per);
}

export function splitExpenseCustom(amount: number, shares: number[]) {
  const totalShares = shares.reduce((s, v) => s + v, 0) || 1;
  return shares.map((v) => Math.round((amount * (v / totalShares)) * 100) / 100);
}
