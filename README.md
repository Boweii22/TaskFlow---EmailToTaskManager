# TaskFlow - Email-to-Task Manager

A beautiful, minimal task management application that automatically converts incoming emails into organized tasks using Postmark integration.

## ✨ Features

### 📧 Email-to-Task Conversion
- Send emails to your unique TaskFlow address
- Automatic parsing of email subject as task title
- Email body becomes task description
- Smart detection of metadata:
  - **Due dates**: "Due: tomorrow", "Due: 2025-06-10", "Due: 3 days"
  - **Priority**: "Priority: High/Medium/Low"
  - **Tags**: "Tags: work, urgent, meeting"

### 🎯 Task Management
- Clean, intuitive task dashboard
- Priority color coding (red=high, amber=medium, blue=low)
- Task completion with smooth animations
- Edit and delete tasks with confirmation
- Comprehensive filtering by status, priority, tags, and search
- Task statistics dashboard

### 🎨 Beautiful Design
- Modern, minimal interface inspired by Apple's design principles
- Light/dark mode toggle with system preference detection
- Responsive design for desktop, tablet, and mobile
- Smooth micro-interactions and hover states
- Consistent 8px spacing system
- Soft color palette with accessibility-focused contrast

### 🔔 Smart Notifications
- Automatic email confirmations for created tasks
- Daily summary emails with task statistics
- Due date reminders
- Overdue task alerts

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Postmark account for email processing

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Click "Connect to Supabase" in the top right of the interface
   - Follow the setup wizard to create your database
   - The required tables will be created automatically

3. **Configure Postmark**:
   - Create a Postmark account at [postmarkapp.com](https://postmarkapp.com)
   - Set up an inbound stream for your domain
   - Configure the webhook URL to point to your Supabase edge function:
     ```
     https://your-project.supabase.co/functions/v1/email-webhook
     ```

4. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   POSTMARK_SERVER_TOKEN=your_postmark_token
   POSTMARK_FROM_EMAIL=tasks@yourdomain.com
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

## 📧 Email Integration Usage

### Basic Task Creation
Send an email to your configured address with:
- **Subject**: Becomes the task title
- **Body**: Becomes the task description

### Smart Parsing
Include these patterns in your email body for automatic parsing:

**Due Dates**:
- `Due: today`
- `Due: tomorrow`  
- `Due: 2025-06-10`
- `Due: 3 days`

**Priority Levels**:
- `Priority: high`
- `Priority: medium`
- `Priority: low`

**Tags**:
- `Tags: work, urgent, meeting`

### Example Email
```
Subject: Review quarterly reports

Hi TaskFlow,

Please review the Q4 reports and prepare summary.

Due: tomorrow
Priority: high
Tags: work, reports, quarterly

Thanks!
```

This creates a high-priority task due tomorrow with appropriate tags.

## 🛠 Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **date-fns** for date manipulation
- **Vite** for development and building

### Backend
- **Supabase** for database and real-time subscriptions
- **PostgreSQL** with Row Level Security
- **Edge Functions** for email processing
- **Postmark** for email sending/receiving

### Database Schema
```sql
tasks (
  id: uuid,
  title: text,
  description: text,
  due_date: date,
  priority: enum('low', 'medium', 'high'),
  tags: text[],
  completed: boolean,
  email_from: text,
  created_at: timestamptz,
  updated_at: timestamptz
)
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── components/          # React components
│   ├── Header.tsx      # App header with theme toggle
│   ├── TaskCard.tsx    # Individual task display
│   ├── TaskFilters.tsx # Filtering controls
│   ├── TaskForm.tsx    # Task creation/editing
│   └── TaskStats.tsx   # Statistics dashboard
├── hooks/              # Custom React hooks
│   ├── useTheme.ts     # Dark/light mode management
│   └── useTasks.ts     # Task management logic
├── lib/                # Utilities and services
│   ├── supabase.ts     # Supabase client
│   ├── taskService.ts  # Task CRUD operations
│   └── emailParser.ts  # Email content parsing
└── types/              # TypeScript definitions
    └── task.ts         # Task-related types
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Teal (#14B8A6)  
- **Accent**: Orange (#F97316)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)

### Priority Colors
- **High Priority**: Red (#EF4444)
- **Medium Priority**: Amber (#F59E0B)
- **Low Priority**: Blue (#3B82F6)

### Typography
- **Headings**: 120% line height, semibold weight
- **Body**: 150% line height, regular weight
- **Maximum**: 3 font weights throughout the app

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Email validation and sanitization
- XSS protection through React's built-in escaping
- CORS properly configured for API endpoints
- Environment variables for sensitive credentials

## 📱 Responsive Design

- **Mobile**: < 768px (single column, touch-optimized)
- **Tablet**: 768px - 1024px (adapted layouts)
- **Desktop**: > 1024px (full feature set)

## 🚀 Deployment

The app is ready for deployment to any modern hosting platform:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**:
   - Netlify, Vercel, or similar
   - Ensure environment variables are configured
   - Set up custom domain for email integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

**TaskFlow** - Transform your inbox into an organized task management system! 📧✅