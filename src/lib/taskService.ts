import { supabase } from './supabase';
import { Task, TaskFilters, TaskStats } from '../types/task';
import { isToday, isPast, parseISO } from 'date-fns';

export class TaskService {
  static async getTasks(filters: TaskFilters): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.userEmail) {
      query = query.eq('email_from', filters.userEmail);
    }

    if (filters.status === 'completed') {
      query = query.eq('completed', true);
    } else if (filters.status === 'pending') {
      query = query.eq('completed', false);
    }

    if (filters.priority !== 'all') {
      query = query.eq('priority', filters.priority);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    let tasks = data || [];

    if (filters.tag) {
      tasks = tasks.filter(task => task.tags.includes(filters.tag));
    }

    return tasks;
  }

  static async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getTaskStats(userEmail: string | null = null): Promise<TaskStats> {
    let query = supabase
      .from('tasks')
      .select('completed, due_date');
    
    if (userEmail) {
      query = query.eq('email_from', userEmail);
    }

    const { data: tasks, error } = await query;

    if (error) throw error;

    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    const pendingTasks = tasks.filter(t => !t.completed);
    const overdue = pendingTasks.filter(t => 
      t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date))
    ).length;
    
    const dueToday = pendingTasks.filter(t => 
      t.due_date && isToday(parseISO(t.due_date))
    ).length;

    return { total, completed, pending, overdue, dueToday };
  }

  static async getAllTags(userEmail: string | null = null): Promise<string[]> {
    let query = supabase
      .from('tasks')
      .select('tags');

    if (userEmail) {
      query = query.eq('email_from', userEmail);
    }

    const { data: tasks, error } = await query;

    if (error) throw error;

    const allTags = tasks.flatMap(t => t.tags);
    return [...new Set(allTags)].sort();
  }
}