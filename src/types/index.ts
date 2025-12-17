export interface Category {
  id: string;
  name: string;
  icon: string; // MaterialCommunityIcons name
  type: 'income' | 'expense';
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  note: string;
  categoryId?: string;
  imageUri?: string;
  date: string; // ISO string
}

export interface BalanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
