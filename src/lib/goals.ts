export interface GoalModel {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetAmount: number;
  savedAmount: number;
  deadline: Date;
  category?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export function calculateGoalProgress(goal: GoalModel) {
  const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
  const remaining = goal.targetAmount - goal.savedAmount;
  const daysRemaining = Math.ceil(
    (goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return { progress, remaining, daysRemaining, isCompleted: goal.savedAmount >= goal.targetAmount };
}

export function getGoalStatus(goal: GoalModel) {
  const { progress, daysRemaining, isCompleted } = calculateGoalProgress(goal);
  
  if (isCompleted) return 'completed';
  if (daysRemaining < 0) return 'overdue';
  if (progress === 100) return 'completed';
  if (progress >= 75) return 'almost_done';
  if (progress >= 50) return 'halfway';
  if (progress > 0) return 'in_progress';
  return 'not_started';
}
