import React, { useState } from 'react';
import { Task } from '../types/task';
import { 
  Calendar, 
  Tag, 
  Edit3, 
  Trash2, 
  Check, 
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { format, isToday, isPast, parseISO } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onUpdate, onDelete, onEdit }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);

  const getPriorityColor = (priority: string, completed: boolean) => {
    if (completed) return 'text-green-600 dark:text-green-400';
    
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityBg = (priority: string, completed: boolean) => {
    if (completed) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    
    switch (priority) {
      case 'high': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'medium': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'low': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default: return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getDueDateStatus = () => {
    if (!task.due_date || task.completed) return null;
    
    const dueDate = parseISO(task.due_date);
    if (isPast(dueDate) && !isToday(dueDate)) {
      return { status: 'overdue', color: 'text-red-600 dark:text-red-400' };
    } else if (isToday(dueDate)) {
      return { status: 'today', color: 'text-amber-600 dark:text-amber-400' };
    }
    return { status: 'upcoming', color: 'text-gray-600 dark:text-gray-400' };
  };

  const handleToggleComplete = async () => {
    setIsCompleting(true);
    await onUpdate(task.id, { completed: !task.completed });
    setIsCompleting(false);
  };

  const dueDateStatus = getDueDateStatus();

  return (
    <div className={`
      group relative rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg
      ${getPriorityBg(task.priority, task.completed)}
      ${task.completed ? 'opacity-75' : ''}
    `}>
      {/* Priority indicator */}
      <div className={`absolute top-0 left-6 w-12 h-1 rounded-b-full ${
        task.completed 
          ? 'bg-green-500' 
          : task.priority === 'high' 
            ? 'bg-red-500' 
            : task.priority === 'medium' 
              ? 'bg-amber-500' 
              : 'bg-blue-500'
      }`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={handleToggleComplete}
            disabled={isCompleting}
            className={`
              flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
              transition-all duration-200 hover:scale-110
              ${task.completed 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'border-current hover:bg-current hover:text-white'
              }
              ${isCompleting ? 'animate-pulse' : ''}
            `}
          >
            {task.completed && <Check size={14} />}
          </button>
          
          <h3 className={`
            font-semibold text-lg leading-tight flex-1
            ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}
          `}>
            {task.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
            title="Edit task"
          >
            <Edit3 size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
          
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            title="Delete task"
          >
            <Trash2 size={16} className="text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className={`
          text-sm mb-4 leading-relaxed
          ${task.completed ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}
        `}>
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          {/* Due date */}
          {task.due_date && (
            <div className={`flex items-center gap-1 ${dueDateStatus?.color || 'text-gray-600 dark:text-gray-400'}`}>
              {dueDateStatus?.status === 'overdue' ? (
                <AlertCircle size={14} />
              ) : dueDateStatus?.status === 'today' ? (
                <Clock size={14} />
              ) : (
                <Calendar size={14} />
              )}
              <span className="font-medium">
                {format(parseISO(task.due_date), 'MMM d')}
                {dueDateStatus?.status === 'overdue' && ' (Overdue)'}
                {dueDateStatus?.status === 'today' && ' (Today)'}
              </span>
            </div>
          )}

          {/* Priority */}
          <div className={`flex items-center gap-1 ${getPriorityColor(task.priority, task.completed)}`}>
            <div className={`w-2 h-2 rounded-full ${
              task.completed 
                ? 'bg-green-500' 
                : task.priority === 'high' 
                  ? 'bg-red-500' 
                  : task.priority === 'medium' 
                    ? 'bg-amber-500' 
                    : 'bg-blue-500'
            }`} />
            <span className="font-medium capitalize">{task.priority}</span>
          </div>
        </div>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag size={14} className="text-gray-400" />
            <div className="flex gap-1">
              {task.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 font-medium"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="px-2 py-1 text-xs rounded-full bg-white/60 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400">
                  +{task.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Completion indicator */}
      {task.completed && (
        <div className="absolute top-4 right-4">
          <CheckCircle2 size={20} className="text-green-500" />
        </div>
      )}
    </div>
  );
}