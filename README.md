# Advisor System - Frontend

A modern web application built with React and Vite for managing academic advisor-student relationships, schedules, activities, and academic monitoring.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Build](#build)
- [Features](#features)
- [Project Components](#project-components)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This is the frontend application for the Advisor System, a comprehensive platform designed to facilitate communication and academic management between advisors and students. The system supports role-based access (Admin, Advisor, Student) and provides various features for activity management, academic monitoring, scheduling, and more.

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Styling**: Tailwind CSS 4.1.12
- **UI Components**: Ant Design (antd) 5.27.1
- **HTTP Client**: Axios 1.11.0
- **Routing**: React Router DOM 7.8.2
- **Animations**: Framer Motion 12.23.24
- **Markdown Rendering**: React Markdown 10.1.0
- **Date Handling**: Day.js 1.11.19
- **Icons**: Ant Design Icons, Lucide React, React Icons
- **Notifications**: React Toastify 11.0.5
- **Code Quality**: ESLint 9.36.0
- **Node.js**: 16+ recommended

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── admin/          # Admin-specific components
│   ├── chat/           # Chat widget components
│   ├── context/        # React context providers
│   ├── layout/         # Layout components (Header, Sidebar, Footer)
│   └── share/          # Shared components
├── pages/              # Page components
│   ├── admin/          # Admin dashboard pages
│   │   ├── advisors/   # Advisor management
│   │   ├── classes/    # Class management
│   │   ├── courses/    # Course management
│   │   ├── grades/     # Grade management
│   │   ├── rag/        # RAG (Retrieval-Augmented Generation) features
│   │   ├── schedules/  # Schedule management
│   │   └── semesters/  # Semester management
│   ├── advisor/        # Advisor pages
│   │   ├── activities/ # Activity management
│   │   ├── chat/       # Chat interface
│   │   ├── classes/    # Class details
│   │   ├── dashboard/  # Advisor dashboard
│   │   ├── home/       # Home page
│   │   ├── meetings/   # Meeting management
│   │   ├── notes/      # Notes management
│   │   ├── points/     # Points management
│   │   ├── profile/    # Profile page
│   │   ├── schedules/  # Schedule management
│   │   └── students/   # Student management
│   ├── client/         # Student pages
│   │   ├── academic/   # Academic information
│   │   ├── activities/ # Activity participation
│   │   ├── chat/       # Chat with advisor
│   │   ├── meetings/   # Meeting scheduling
│   │   ├── notes/      # Notes from advisor
│   │   ├── points/     # Points/feedback
│   │   └── profile/    # Student profile
│   ├── HomePage.jsx    # Landing page
│   ├── LoginPage.jsx   # Login page
│   └── StudentPage.jsx # Student notification page
├── services/           # API services
│   ├── api.service.js           # Main API service
│   ├── axios.customize.js       # Axios configuration
│   ├── meeting.service.js       # Meeting API calls
│   ├── pointFeedback.service.js # Point feedback API calls
│   └── rag.service.js          # RAG feature API calls
├── utils/              # Utility functions
│   └── avatarHelper.js # Avatar generation helper
├── share/              # Shared utilities and routes
│   ├── private.route.jsx     # Private route protection
│   ├── ProtectedRoute.jsx    # Role-based route protection
│   └── Unauthorized.page.jsx # Unauthorized access page
├── assets/             # Static assets
├── App.jsx             # Main app component
├── main.jsx            # Application entry point
└── index.css           # Global styles
```

## 📦 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Backend API Server** running on `http://localhost:8000` (or configured URL)
- **Chatbot Service** (optional) running on `http://localhost:8001` for development

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd AdvisorSystem_FE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   or if using yarn:
   ```bash
   yarn install
   ```

## ⚙️ Configuration

### Environment Variables

Create or update the `.env.development` and `.env.production` files in the project root:

**Development (.env.development)**

```dotenv
VITE_BACKEND_URL=http://localhost:8000
VITE_CHATBOT=http://localhost:8001
```

**Production (.env.production)**

```dotenv
VITE_BACKEND_URL=https://api.yourdomain.com
```

### Vite Configuration

The project uses Vite as the build tool with Tailwind CSS and React plugins configured in `vite.config.js`.

## 💻 Development

Start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will typically run on `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## 📦 Build

Create a production-ready build:

```bash
npm run build
```

This generates an optimized build in the `dist/` directory.

Preview the production build locally:

```bash
npm run preview
```

## ✨ Features

### Admin Features

- Dashboard overview
- Manage advisors and advisor classes
- Manage student classes and class members
- Manage courses and grades
- Schedule management
- Semester and grade reports
- RAG-based document management and chat assistant
- Meeting detail tracking

### Advisor Features

- Personalized dashboard
- Manage assigned classes and students
- Create and manage activities
- Track activity registrations and statistics
- Schedule management (student and class schedules)
- Meeting scheduling and management
- Student feedback and point management
- Send notifications to students
- Create and manage notes
- Direct chat with students
- Academic monitoring

### Student Features

- View dashboard with important information
- Check academic records and grades
- Register for activities
- View assigned meetings
- Receive notifications from advisors
- Communicate with advisors via chat
- View feedback and points from advisors
- Manage personal profile
- Track attendance

## 🧩 Project Components

### Key Components

- **Layout Components**: Header, Footer, Sidebar (Admin, Advisor)
- **Chat Widget**: Real-time communication interface
- **Protected Routes**: Role-based access control
- **Authentication Context**: Global auth state management
- **RAG Chat Assistant**: AI-powered document retrieval and chat

### Services

- **API Service**: Centralized HTTP client for backend communication
- **Axios Customization**: Interceptors for token management and error handling
- **Meeting Service**: Dedicated service for meeting-related API calls
- **Point Feedback Service**: Service for managing student feedback and points
- **RAG Service**: Service for RAG feature integration

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Protected routes with authorization checks
- Secure API interceptors with automatic token refresh

## 🚀 Deployment

The application can be deployed to various platforms:

- **Vercel**: `npm run build` → Deploy `dist/` folder
- **Netlify**: Connect GitHub repository
- **Docker**: Use provided Dockerfile in the project
- **Traditional Hosting**: Build and serve `dist/` folder using a web server

## 📝 API Documentation

For detailed API documentation, refer to the backend documentation files:

- `docs/API_ADMIN.md`
- `docs/API_ADVISOR.md`
- `docs/API_STUDENT.md`
- Backend API Documentation in `AdvisorSystem/docs/`

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## 📋 Code Quality

The project uses ESLint for code quality. Run the linter:

```bash
npm run lint
```

## 📚 Additional Documentation

- `MONITORING_NOTES_IMPLEMENTATION.md` - Implementation notes for monitoring features
- `POINT_FEEDBACK_UPDATE_FILE_UPLOAD.md` - Documentation for point feedback updates
- `docs/RAG_FEATURE.md` - RAG feature documentation
- `docs/MEETING_STATISTICS_GUIDE.md` - Meeting statistics guide

## 🔗 Related Projects

- **Backend API**: `AdvisorSystem/` (Laravel application)
- **RAG Test**: `RAG-Test/` (Python/Flask RAG backend)
- **RAG UI Test**: `RAG-UI-Test/` (RAG frontend)

## ⚡ Performance

- **Vite**: Fast module hot replacement and optimized builds
- **React 19**: Latest React features and optimizations
- **Lazy Loading**: Route-based code splitting for faster initial load
- **Tailwind CSS**: Utility-first CSS with optimized bundle size

## 🆘 Troubleshooting

### Development Server Won't Start

- Ensure Node.js version is 16+
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check if port 5173 is already in use

### API Connection Issues

- Verify backend server is running on configured URL
- Check `.env` variables are correctly set
- Review browser console for CORS or authentication errors

### Build Errors

- Run `npm run lint` to check for code issues
- Ensure all dependencies are installed
- Clear build cache: `rm -rf dist && npm run build`

## 📄 License

This project is part of a university capstone/thesis project.

---

**For more information or support, please contact the project maintainers.**
