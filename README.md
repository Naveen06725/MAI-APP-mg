# MAI Platform - Comprehensive Application Documentation

## Overview
MAI Platform is a comprehensive collaboration and productivity platform that combines smart meeting management, AI voice interactions, code collaboration, and social media features into a unified experience.

## Core Functionalities

### 1. Authentication System
- **User Registration**: Complete user onboarding with personal details and address information
- **OTP Email Verification**: 6-digit PIN sent to email for account verification
- **Username-based Login**: Secure authentication using username/password combination
- **Admin Access**: Hardcoded admin credentials (Username: Admin, Password: Happy@152624)
- **Session Management**: 8-minute inactivity timeout for all users
- **Field Validation**: Real-time validation for unique usernames, emails, and mobile numbers
- **Auto-Login**: Automatic login after successful OTP verification

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
- **Database Management**: Complete CRUD operations on all database tables
- **User Management**: View, edit, delete, and manage all user profiles
- **SQL Query Interface**: Execute custom SQL queries directly from the dashboard
- **Data Cleanup**: Clear test data and manage database records
- **User Analytics**: Comprehensive user statistics and growth metrics
- **Meeting Analytics**: Live meeting statistics and historical data
- **Graphical Representations**: Charts and graphs for data visualization

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
- **admin_stats**: Platform analytics, metrics, and temporary OTP storage

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
5. Account created immediately in database
6. 6-digit OTP sent to user's email address
7. User redirected to OTP verification screen (`/auth/verify-otp`)
8. User enters 6-digit verification code
9. System creates Supabase auth user and automatically logs in
10. User redirected to dashboard with full platform access

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

### Admin Database Management Flow
1. Admin accesses Database tab in admin dashboard
2. Views all database tables with real-time data
3. Can edit individual records inline
4. Delete records with confirmation dialogs
5. Execute custom SQL queries for advanced operations
6. Clear all test data while preserving admin account
7. Export data and manage database schema

## Security Features
- **OTP Verification**: Email-based one-time password for secure account verification
- **Session Management**: Automatic logout after 8 minutes of inactivity
- **Input Validation**: Comprehensive form validation and sanitization
- **Unique Constraints**: Database-level uniqueness for usernames, emails, mobile
- **Admin Protection**: Hardcoded admin credentials with special handling
- **Database Security**: Row-level security policies and service role permissions
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

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Git for version control
- Supabase account for database
- Groq API key for AI features

### Local Development Setup

#### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/your-username/MAI-APP-mg.git
cd MAI-APP-mg
\`\`\`

#### 2. Install Dependencies
\`\`\`bash
npm install
# or
yarn install
\`\`\`

#### 3. Environment Configuration
Create a `.env.local` file in the root directory:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Groq AI Configuration
GROQ_API_KEY=your_groq_api_key

# Database Configuration (Auto-generated by Supabase)
POSTGRES_URL=your_postgres_connection_string
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
POSTGRES_HOST=your_postgres_host

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
\`\`\`

#### 4. Database Setup
Run the SQL migration scripts in your Supabase dashboard:
\`\`\`bash
# Execute these files in Supabase SQL Editor:
# - scripts/create_profiles_table.sql
# - scripts/create_meetings_table.sql
# - scripts/create_social_tables.sql
# - scripts/update_profiles_table.sql
\`\`\`

#### 5. Run Development Server
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Visit `http://localhost:3000` to see the application.

### Default Admin Credentials
- **Username**: Admin
- **Password**: Happy@152624

## 🌐 Making the Application Publicly Accessible

### Option 1: Vercel Deployment (Recommended)

#### Quick Deploy
1. **Connect to Vercel**:
   \`\`\`bash
   npm i -g vercel
   vercel login
   vercel
   \`\`\`

2. **Configure Environment Variables**:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all environment variables from your `.env.local`
   - Update `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` to your Vercel domain

3. **Deploy**:
   \`\`\`bash
   vercel --prod
   \`\`\`

#### GitHub Integration
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Automatic deployments on every push to main branch

### Option 2: Other Hosting Platforms

#### Netlify
\`\`\`bash
npm run build
npm run export
# Upload dist folder to Netlify
\`\`\`

#### Railway
\`\`\`bash
railway login
railway new
railway add
railway deploy
\`\`\`

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Configure build settings: `npm run build`
3. Set environment variables
4. Deploy

## 🏭 Production Ready Checklist

### Security Hardening
- [ ] **Environment Variables**: All sensitive data in environment variables
- [ ] **HTTPS**: SSL certificate configured
- [ ] **CORS**: Proper CORS configuration for API routes
- [ ] **Rate Limiting**: Implement rate limiting for API endpoints
- [ ] **Input Validation**: All user inputs validated and sanitized
- [ ] **Admin Security**: Change default admin credentials

### Performance Optimization
- [ ] **Image Optimization**: Next.js Image component for all images
- [ ] **Code Splitting**: Lazy loading for heavy components
- [ ] **Caching**: Redis or similar for session and data caching
- [ ] **CDN**: Static assets served via CDN
- [ ] **Database Indexing**: Proper database indexes for queries
- [ ] **Bundle Analysis**: Analyze and optimize bundle size

### Monitoring & Analytics
- [ ] **Error Tracking**: Sentry or similar error tracking
- [ ] **Performance Monitoring**: Web vitals and performance metrics
- [ ] **User Analytics**: Google Analytics or similar
- [ ] **Uptime Monitoring**: Service uptime monitoring
- [ ] **Database Monitoring**: Query performance monitoring

### Backup & Recovery
- [ ] **Database Backups**: Automated daily backups
- [ ] **Code Backups**: Repository mirroring
- [ ] **Disaster Recovery**: Recovery procedures documented
- [ ] **Data Export**: User data export functionality

### Compliance & Legal
- [ ] **Privacy Policy**: GDPR/CCPA compliance
- [ ] **Terms of Service**: Legal terms and conditions
- [ ] **Cookie Policy**: Cookie usage disclosure
- [ ] **Data Retention**: Data retention policies

## 🧪 Testing from Git Repository

### Quick Test Setup
\`\`\`bash
# Clone and test
git clone https://github.com/your-username/MAI-APP-mg.git
cd MAI-APP-mg
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
\`\`\`

### Testing Checklist
- [ ] **User Registration**: Create new account with unique details
- [ ] **OTP Verification**: Verify email with 6-digit code
- [ ] **Auto-Login**: Confirm automatic login after OTP verification
- [ ] **User Login**: Login with created credentials
- [ ] **Admin Access**: Login with Admin/Happy@152624
- [ ] **Admin Database**: Test database management features
- [ ] **Meeting Creation**: Create and join meetings
- [ ] **Voice Assistant**: Test AI voice interactions
- [ ] **Code Editor**: Create and save code projects
- [ ] **Social Features**: Create posts, like, comment
- [ ] **Home Navigation**: Test home button functionality
- [ ] **Mobile Responsiveness**: Test on mobile devices

### Test Data
Use these test credentials for development:
\`\`\`
Username: TestUser
Email: test@example.com
Mobile: +1234567890
Password: TestPass123
\`\`\`

## 🚀 Deployment Options

### 1. Vercel (Recommended)
**Pros**: Seamless Next.js integration, automatic deployments, edge functions
**Setup Time**: 5 minutes
\`\`\`bash
vercel --prod
\`\`\`

### 2. Netlify
**Pros**: Great for static sites, easy setup, good free tier
**Setup Time**: 10 minutes
\`\`\`bash
npm run build && npm run export
\`\`\`

### 3. Railway
**Pros**: Simple deployment, database included, good for full-stack apps
**Setup Time**: 15 minutes
\`\`\`bash
railway deploy
\`\`\`

### 4. DigitalOcean App Platform
**Pros**: Scalable, managed infrastructure, competitive pricing
**Setup Time**: 20 minutes

### 5. AWS Amplify
**Pros**: AWS ecosystem integration, scalable, enterprise features
**Setup Time**: 30 minutes

### 6. Self-Hosted (VPS)
**Pros**: Full control, cost-effective for high traffic
**Setup Time**: 2-4 hours
\`\`\`bash
# Example with PM2
npm install -g pm2
npm run build
pm2 start npm --name "mai-platform" -- start
\`\`\`

## 🔧 Environment Variables Reference

### Required Variables
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY=         # Supabase service role key (required for admin operations)
GROQ_API_KEY=                      # Groq AI API key
NEXT_PUBLIC_SITE_URL=              # Your application URL (for OTP verification)
\`\`\`

### Optional Variables
\`\`\`env
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=  # Development redirect URL
NEXT_PUBLIC_APP_URL=                    # Production app URL
NODE_ENV=                               # Environment (development/production)
\`\`\`

### Database Variables (Auto-configured)
\`\`\`env
POSTGRES_URL=                      # Main connection string
POSTGRES_PRISMA_URL=              # Prisma connection string
POSTGRES_URL_NON_POOLING=         # Non-pooling connection
POSTGRES_USER=                    # Database user
POSTGRES_PASSWORD=                # Database password
POSTGRES_DATABASE=                # Database name
POSTGRES_HOST=                    # Database host
\`\`\`

## 📞 Support & Troubleshooting

### Common Issues
1. **OTP Not Received**: Check email spam folder and SMTP configuration
2. **Database Connection**: Check Supabase credentials and network access
3. **Admin Operations**: Ensure service role key is configured correctly
4. **AI Features**: Verify Groq API key and rate limits
5. **Authentication**: Ensure redirect URLs match deployment domain
6. **Build Errors**: Check Node.js version compatibility (18+)

### Getting Help
- **Documentation**: Refer to this README and code comments
- **Issues**: Create GitHub issues for bugs and feature requests
- **Community**: Join our Discord/Slack for community support

### Development Tips
- Use `npm run dev` for hot reloading during development
- Check browser console for client-side errors
- Monitor Supabase logs for database issues
- Use Vercel Analytics for production monitoring

*Last Updated: January 2025*
