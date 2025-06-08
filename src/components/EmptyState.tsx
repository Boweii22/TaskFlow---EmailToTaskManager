import React from 'react';
import { Mail, Plus } from 'lucide-react';

interface EmptyStateProps {
  onNewTask: () => void;
  hasFilters: boolean;
}

export function EmptyState({ onNewTask, hasFilters }: EmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No tasks match your filters
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Try adjusting your search criteria or clearing filters.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 
                    rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail className="w-10 h-10 text-blue-500 dark:text-blue-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        Welcome to TaskFlow
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
        Transform your emails into organized tasks. Send emails to your unique TaskFlow address 
        or create tasks manually to get started.
      </p>

      <div className="space-y-4">
        <button
          onClick={onNewTask}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg 
                   hover:bg-blue-600 transition-colors font-medium shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Create Your First Task
        </button>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 max-w-lg mx-auto">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            📧 Email Integration
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Send emails to <strong>1b74301c945930e766695c5df7de19eb@inbound.postmarkapp.com</strong> and they'll automatically 
            become tasks. Include "Due: tomorrow", "Priority: high", and "Tags: work, urgent" 
            in your email body for smart parsing.
          </p>
        </div>
      </div>
    </div>
  );
}