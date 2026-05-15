import { BaseFirestoreService } from './base.service';
import { COLLECTIONS } from '../../constants/collections';
import type { PolicyModel } from '../../lib/policies';

export class PoliciesService extends BaseFirestoreService<PolicyModel> {
  constructor() {
    super(COLLECTIONS.POLICIES);
  }

  async getUserPolicies(userId: string) {
    return this.getByUserId(userId);
  }

  async createPolicy(userId: string, policy: Omit<PolicyModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>) {
    const payload = {
      ...policy,
      userId,
    };
    return this.create(payload as any);
  }

  async updatePolicy(policyId: string, policy: Partial<PolicyModel>) {
    return this.update(policyId, policy as any);
  }

  async deletePolicy(policyId: string) {
    return this.softDelete(policyId);
  }

  async getTotalPremium(userId: string) {
    const policies = await this.getUserPolicies(userId);
    if (!policies.success) return 0;
    const policyItems = Array.isArray(policies.data)
      ? policies.data
      : Array.isArray(policies.data?.data)
      ? policies.data.data
      : [];
    return policyItems.reduce((sum, policy) => sum + (policy.premium || 0), 0) || 0;
  }

  async getActivePolicies(userId: string) {
    const policies = await this.getUserPolicies(userId);
    if (!policies.success) return [];
    const policyItems = Array.isArray(policies.data)
      ? policies.data
      : Array.isArray(policies.data?.data)
      ? policies.data.data
      : [];
    const now = new Date();
    return policyItems.filter(p => p.renewalDate > now);
  }
}

export const policiesService = new PoliciesService();
