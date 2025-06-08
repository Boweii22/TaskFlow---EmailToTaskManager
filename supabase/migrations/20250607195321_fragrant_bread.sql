/*
  # Create tasks table and security

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text, required) - Task title from email subject
      - `description` (text) - Task description from email body
      - `due_date` (date, optional) - Parsed due date
      - `priority` (text) - Priority level: low, medium, high
      - `tags` (text array) - Tags parsed from email or manually added
      - `completed` (boolean) - Task completion status
      - `email_from` (text, optional) - Original sender email address
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `tasks` table
    - Add policies for public access (since this is a demo)
    - In production, you would restrict access to authenticated users
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  due_date date,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  tags text[] DEFAULT '{}',
  completed boolean DEFAULT false,
  email_from text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow public access for demo purposes
-- In production, replace with user-specific policies
CREATE POLICY "Allow public access to tasks"
  ON tasks
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);