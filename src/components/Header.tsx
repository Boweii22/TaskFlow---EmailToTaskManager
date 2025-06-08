import React, { useState, useEffect } from 'react';
import { Mail, Moon, Sun, Plus, LogOut, Info } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onNewTask: () => void;
  onShowEmailInstructions: () => void;
}

export function Header({ onNewTask, onShowEmailInstructions }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                TaskFlow
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Email-to-Task Manager
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={onShowEmailInstructions}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="View Email Instructions"
            >
              <Info size={20} className="text-gray-600 dark:text-gray-300" />
            </button>

            <button
              onClick={onNewTask}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg 
                       hover:bg-blue-600 transition-colors font-medium"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New Task</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon size={20} className="text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun size={20} className="text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {session && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Logout"
              >
                <LogOut size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}