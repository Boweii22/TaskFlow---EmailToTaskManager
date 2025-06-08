export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  completed: boolean;
  created_at: string;
  updated_at: string;
  email_from?: string;
}

export interface TaskFilters {
  status: 'all' | 'pending' | 'completed';
  priority: 'all' | 'low' | 'medium' | 'high';
  tag: string | null;
  search: string;
  userEmail: string | null;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  dueToday: number;
}