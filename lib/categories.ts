export type CategoryType = 'expense' | 'income' | 'transfer';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  parentId?: string | null;
  color?: string; // hex or css color
  icon?: string; // emoji or icon name
}

export const getCategoriesByType = (categories: Category[], type: CategoryType) =>
  categories.filter((category) => category.type === type);

export const findCategory = (categories: Category[], id: string) =>
  categories.find((category) => category.id === id) || null;
