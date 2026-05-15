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
    return this.delete(policyId);
  }

  async getTotalPremium(userId: string) {
    const policies = await this.getUserPolicies(userId);
    if (!policies.success) return 0;
    return policies.data?.reduce((sum, policy) => sum + (policy.premium || 0), 0) || 0;
  }

  async getActivePolicies(userId: string) {
    const policies = await this.getUserPolicies(userId);
    if (!policies.success) return [];
    
    const now = new Date();
    return policies.data?.filter(p => p.renewalDate > now) || [];
  }
}

export const policiesService = new PoliciesService();
