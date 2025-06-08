import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TaskStats } from './components/TaskStats';
import { TaskFilters } from './components/TaskFilters';
import { TaskCard } from './components/TaskCard';
import { TaskForm } from './components/TaskForm';
import { EmptyState } from './components/EmptyState';
import { useTasks } from './hooks/useTasks';
import { Task } from './types/task';
import { Plus, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { EmailInstructionsModal } from './components/EmailInstructionsModal';
import { Footer } from './components/Footer';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

interface ProtectedRouteProps {
  session: any;
}

const ProtectedRoute = ({ session }: ProtectedRouteProps) => {
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

function AppContent() {
  const {
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
    refresh,
  } = useTasks();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEmailInstructionsModal, setShowEmailInstructionsModal] = useState(false);

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    await createTask(taskData);
    setShowTaskForm(false);
  };

  const handleEditTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
      setEditingTask(null);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
    }
  };

  const hasActiveFilters = !!filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.tag !== null;

  const handleShowEmailInstructions = () => {
    setShowEmailInstructionsModal(true);
  };

  const handleCloseEmailInstructionsModal = () => {
    setShowEmailInstructionsModal(false);
  };

  // Floating action button for mobile
  const FloatingActionButton = () => (
    <button
      onClick={() => setShowTaskForm(true)}
      className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-xl 
               hover:bg-blue-600 hover:shadow-2xl transition-all duration-200 z-40
               flex items-center justify-center lg:hidden"
    >
      <Plus size={24} />
    </button>
  );

  // For simplicity, using a placeholder for the inbound email address. 
  // In a real application, this might be fetched from a config or environment variable.
  const inboundEmailAddress = "1b74301c945930e766695c5df7de19eb@inbound.postmarkapp.com"; 

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Connection Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg 
                     hover:bg-blue-600 transition-colors font-medium"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header onNewTask={() => setShowTaskForm(true)} onShowEmailInstructions={handleShowEmailInstructions} />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <TaskStats stats={stats} />

        <div className="mb-8">
          <TaskFilters
            filters={filters}
            tags={tags}
            onFiltersChange={updateFilters}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState onNewTask={() => setShowTaskForm(true)} hasFilters={hasActiveFilters} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={updateTask}
                onDelete={handleDeleteTask}
                onEdit={setEditingTask}
              />
            ))}
          </div>
        )}
      </main>

      {(showTaskForm || editingTask) && (
        <TaskForm
          task={editingTask || undefined}
          onSubmit={editingTask ? handleEditTask : handleCreateTask}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}

      <FloatingActionButton />

      {showEmailInstructionsModal && (
        <EmailInstructionsModal
          isOpen={showEmailInstructionsModal}
          onClose={handleCloseEmailInstructionsModal}
          inboundEmailAddress={inboundEmailAddress}
        />
      )}

      <Footer />
    </div>
  );
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoadingSession(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<ProtectedRoute session={session} />}>
          <Route index element={<AppContent />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;