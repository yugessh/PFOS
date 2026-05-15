import { BaseFirestoreService } from './base.service';
import { COLLECTIONS } from '../../constants/collections';
import type { GoalModel } from '../../lib/goals';

export class GoalsService extends BaseFirestoreService<GoalModel> {
  constructor() {
    super(COLLECTIONS.GOALS);
  }

  async getUserGoals(userId: string) {
    return this.getByUserId(userId);
  }

  async createGoal(userId: string, goal: Omit<GoalModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'>) {
    const payload = {
      ...goal,
      userId,
    };
    return this.create(payload as any);
  }

  async updateGoal(goalId: string, goal: Partial<GoalModel>) {
    return this.update(goalId, goal as any);
  }

  async deleteGoal(goalId: string) {
    return this.delete(goalId);
  }

  async updateSavedAmount(goalId: string, newAmount: number) {
    return this.update(goalId, { savedAmount: newAmount } as any);
  }

  async getTotalGoals(userId: string) {
    const goals = await this.getUserGoals(userId);
    if (!goals.success) return 0;
    return goals.data?.length || 0;
  }

  async getTotalTargetAmount(userId: string) {
    const goals = await this.getUserGoals(userId);
    if (!goals.success) return 0;
    return goals.data?.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0) || 0;
  }

  async getTotalSavedAmount(userId: string) {
    const goals = await this.getUserGoals(userId);
    if (!goals.success) return 0;
    return goals.data?.reduce((sum, goal) => sum + (goal.savedAmount || 0), 0) || 0;
  }
}

export const goalsService = new GoalsService();

