import { useState, useEffect, useCallback } from 'react';
import { Task, TaskFilters, TaskStats } from '../types/task';
import { TaskService } from '../lib/taskService';
import { supabase } from '../lib/supabase';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    dueToday: 0,
  });
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    priority: 'all',
    tag: null,
    search: '',
    userEmail: null,
  });

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setFilters(prev => ({ ...prev, userEmail: session.user.email }));
      } else {
        setFilters(prev => ({ ...prev, userEmail: null }));
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user?.email) {
          setFilters(prev => ({ ...prev, userEmail: session.user.email }));
        } else {
          setFilters(prev => ({ ...prev, userEmail: null }));
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadTasks = useCallback(async () => {
    if (filters.userEmail === null) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [tasksData, statsData, tagsData] = await Promise.all([
        TaskService.getTasks(filters),
        TaskService.getTaskStats(filters.userEmail),
        TaskService.getAllTags(filters.userEmail),
      ]);
      
      setTasks(tasksData);
      setStats(statsData);
      setTags(tagsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (!filters.userEmail) {
      setError('Cannot create task: User email not found.');
      return;
    }
    try {
      await TaskService.createTask({ ...taskData, email_from: filters.userEmail });
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await TaskService.updateTask(id, updates);
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await TaskService.deleteTask(id);
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const updateFilters = (newFilters: Partial<TaskFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    tasks,
    stats,
    tags,
    filters,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    updateFilters,
    refresh: loadTasks,
  };
}