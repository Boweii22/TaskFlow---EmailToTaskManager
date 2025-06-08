import React from 'react';
import { TaskFilters as TaskFiltersType } from '../types/task';
import { Search, Filter, X } from 'lucide-react';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  tags: string[];
  onFiltersChange: (filters: Partial<TaskFiltersType>) => void;
}

export function TaskFilters({ filters, tags, onFiltersChange }: TaskFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Status filter */}
        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
          {(['all', 'pending', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => onFiltersChange({ status })}
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-all capitalize
                ${filters.status === status
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Priority filter */}
        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
          {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
            <button
              key={priority}
              onClick={() => onFiltersChange({ priority })}
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-all capitalize
                ${filters.priority === priority
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              {priority === 'all' ? 'All Priority' : priority}
            </button>
          ))}
        </div>

        {/* Tag filter */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={filters.tag || ''}
              onChange={(e) => onFiltersChange({ tag: e.target.value || null })}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Active filters indicator */}
      {(filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.tag) && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
          <div className="flex gap-2">
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                Search: "{filters.search}"
                <button onClick={() => onFiltersChange({ search: '' })}>
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.status !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full capitalize">
                {filters.status}
                <button onClick={() => onFiltersChange({ status: 'all' })}>
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.priority !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full capitalize">
                {filters.priority}
                <button onClick={() => onFiltersChange({ priority: 'all' })}>
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.tag && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full">
                {filters.tag}
                <button onClick={() => onFiltersChange({ tag: null })}>
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}