# MAI Platform - Comprehensive Application Documentation

## Overview
MAI Platform is a comprehensive collaboration and productivity platform that combines smart meeting management, AI voice interactions, code collaboration, and social media features into a unified experience.

## Core Functionalities

### 1. Authentication System
- **User Registration**: Complete user onboarding with personal details and address information
- **Username-based Login**: Secure authentication using username/password combination
- **Admin Access**: Hardcoded admin credentials (Username: Admin, Password: Happy@152624)
- **Session Management**: 8-minute inactivity timeout for all users
- **Field Validation**: Real-time validation for unique usernames, emails, and mobile numbers
- **OTP Verification**: Email-based one-time password verification for new registrations

### 2. Smart Meeting System
- **Meeting Creation**: Users can create meetings with title, description, and participant management
- **Live Meeting Management**: Real-time meeting status tracking (scheduled, active, completed)
- **Participant Controls**: Join/leave functionality with participant tracking
- **Host Controls**: Meeting start/end capabilities for meeting hosts
- **Meeting Dashboard**: Overview of all user meetings with status indicators

### 3. AI Voice Integration
- **Voice Recording**: Web Speech API integration for voice input
- **AI Processing**: Groq-powered AI responses using Llama models
- **Text-to-Speech**: Automated voice responses from AI assistant
- **Conversation History**: Database storage of all voice interactions
- **Meeting Integration**: Voice assistant available during meetings
- **Dedicated Voice Page**: Standalone voice interaction interface

### 4. Code Editor & Collaboration
- **Monaco Editor**: Full-featured code editor with syntax highlighting
- **Multi-language Support**: JavaScript, TypeScript, Python, HTML, CSS, and more
- **Project Management**: Create, save, and manage code projects
- **Real-time Collaboration**: Share projects with other users
- **Auto-save**: Automatic project saving every 30 seconds
- **Code Execution**: Run code directly in the browser environment
- **File Management**: Upload and manage project files

### 5. Social Media Platform
- **News Feed**: Facebook-style social feed with posts and interactions
- **Reels System**: Instagram-style vertical video feed
- **Post Creation**: Text, image, and video post creation
- **Social Interactions**: Like, comment, and share functionality
- **User Following**: Follow/unfollow system for social connections
- **Media Upload**: Support for images, videos, and GIFs

### 6. Media Sharing & Camera Features
- **Camera Integration**: Direct photo and video capture from device camera
- **File Upload**: Drag-and-drop file upload with multiple format support
- **Emoji & GIF Support**: Rich media integration across all features
- **Cross-platform Sharing**: Media sharing across meetings, social posts, and code projects
- **Real-time Media**: Live camera feeds during meetings

### 7. Admin Dashboard
- **Real-time Analytics**: Live statistics with 30-second refresh intervals
- **Meeting Statistics**: 
  - Number of live meetings
  - Total meetings created
  - Meeting frequency analytics
  - Average meeting duration
- **User Analytics**:
  - Total registered users
  - User growth trends
  - Active user metrics
  - User engagement statistics
- **Graphical Representations**:
  - Line charts for user growth
  - Bar charts for meeting frequency
  - Pie charts for user distribution
  - Activity heatmaps
- **Advanced Filtering**: Date range, user type, and activity filters
- **User Management**: View, edit, and manage all user profiles

## Application Architecture

### Database Schema
- **profiles**: User information with personal details and admin flags
- **meetings**: Meeting records with host, participants, and status
- **meeting_participants**: Join/leave activity tracking
- **voice_interactions**: AI conversation logs and history
- **code_projects**: Generated code storage and project management
- **posts**: Social media posts with content and metadata
- **likes**: Post interaction tracking
- **comments**: Post comment system
- **follows**: User relationship management
- **admin_stats**: Platform analytics and metrics

### Technology Stack
- **Frontend**: Next.js 15 with App Router, React, TypeScript
- **Styling**: Tailwind CSS v4 with custom blue gradient theme
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Authentication**: Supabase Auth with custom session management
- **AI Integration**: Groq API with Llama models
- **Code Editor**: Monaco Editor with multi-language support
- **Charts**: Recharts with shadcn/ui chart components
- **Media**: Web APIs for camera, speech recognition, and file handling

## End-to-End Application Flow

### User Registration Flow
1. User accesses registration page (`/auth/sign-up`)
2. Fills out comprehensive form with personal and address details
3. Real-time validation checks for unique username, email, mobile
4. Password confirmation validation
5. OTP verification sent to email
6. User enters 6-digit verification code
7. Account created and profile stored in database
8. Automatic redirect to login page

### User Login Flow
1. User accesses login page (`/auth/login`)
2. Enters username and password
3. System validates credentials against database
4. Session cookie created with 8-minute inactivity timeout
5. Redirect to user dashboard with full platform access

### Admin Login Flow
1. Admin enters hardcoded credentials (Admin/Happy@152624)
2. System recognizes admin login and bypasses database validation
3. Admin session cookie created
4. Redirect to admin dashboard with analytics and user management

### Meeting Creation & Management Flow
1. User navigates to meetings section in dashboard
2. Clicks "Create Meeting" and fills out meeting details
3. Meeting record created in database with "scheduled" status
4. Participants can join meeting using meeting ID
5. Host starts meeting, status changes to "active"
6. Real-time participant tracking and meeting controls
7. Host ends meeting, status changes to "completed"
8. Meeting history and analytics updated

### AI Voice Interaction Flow
1. User clicks voice assistant button (available in meetings or dedicated page)
2. Web Speech API captures voice input
3. Audio converted to text and sent to Groq AI
4. AI processes request and generates response
5. Response converted to speech using Text-to-Speech API
6. Interaction logged in database for history tracking
7. User can continue conversation or end session

### Code Collaboration Flow
1. User accesses code editor from dashboard
2. Creates new project or opens existing project
3. Monaco Editor loads with syntax highlighting
4. User writes/edits code with auto-save every 30 seconds
5. Project can be shared with other users via share link
6. Real-time collaboration allows multiple users to edit
7. Code can be executed directly in browser
8. Project history and versions maintained

### Social Media Flow
1. User creates post with text, images, or videos
2. Post published to news feed visible to followers
3. Other users can like, comment, and share posts
4. Reels can be created with vertical video format
5. Social interactions tracked and displayed
6. User profiles show post history and social connections
7. Following system enables personalized content feeds

### Admin Analytics Flow
1. Admin accesses dashboard with comprehensive analytics
2. Real-time data refreshes every 30 seconds
3. Charts and graphs display platform usage metrics
4. Filtering options allow detailed analysis
5. User management tools for profile editing
6. Meeting statistics and trends analysis
7. Export capabilities for reporting

## Security Features
- **Session Management**: Automatic logout after 8 minutes of inactivity
- **Input Validation**: Comprehensive form validation and sanitization
- **Unique Constraints**: Database-level uniqueness for usernames, emails, mobile
- **Admin Protection**: Hardcoded admin credentials with special handling
- **CSRF Protection**: Next.js built-in CSRF protection for forms
- **Secure Cookies**: HttpOnly, Secure, and SameSite cookie attributes

## Performance Optimizations
- **Real-time Updates**: Efficient polling and WebSocket connections
- **Auto-save**: Prevents data loss with automatic saving
- **Lazy Loading**: Components and images loaded on demand
- **Caching**: Strategic caching for frequently accessed data
- **Responsive Design**: Mobile-first approach with optimized layouts

## Deployment & Configuration
- **Environment Variables**: Comprehensive environment variable setup
- **Database Migrations**: SQL scripts for schema updates
- **Integration Setup**: Supabase and Groq API configuration
- **Build Optimization**: Next.js production build optimizations

## Support & Maintenance
- **Error Handling**: Comprehensive error catching and user feedback
- **Logging**: Detailed logging for debugging and monitoring
- **Analytics**: Built-in analytics for usage tracking
- **Backup**: Database backup and recovery procedures

This documentation provides a complete overview of the MAI Platform's capabilities, architecture, and operational flows.
