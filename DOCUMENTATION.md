# HopeXavier First Academy - Web Application Documentation

## Overview
HopeXavier First Academy is a modern, responsive full-stack web application designed for a school/academy. It serves both as a public-facing portal for students and parents, and as an administrative backend (CMS) for the school staff. The application is built using React (Vite, TypeScript), Tailwind CSS, and shadcn/ui components, powered by a Supabase backend for database and authentication.

## Architecture & Technology Stack
- **Frontend Framework**: React 18+ with Vite and TypeScript.
- **Styling**: Tailwind CSS combined with custom UI components from shadcn/ui. Animations powered by `motion`.
- **Icons**: Lucide React.
- **Routing**: React Router DOM (v6+).
- **Backend/Database**: Supabase (PostgreSQL, Storage, Auth).
- **State Management**: React Hooks (useState, useEffect) with an intelligent fallback mechanism to `localStorage` when the database is unreachable or offline.

## Public Portal Features

The public interface provides essential information and action points for prospective and current students.

1. **Home (`/`)**: Main landing page showcasing the academy's values, mission, and quick links.
2. **About Us (`/about`)**: Detailed information about the school's history, vision, and educators.
3. **Services (`/services`)**: Outline of educational programs, extracurricula activities, and facilities.
4. **Admission / Apply (`/apply`)**: A comprehensive application form for prospective students to apply online.
5. **Blog & News (`/blog`)**: A dynamic listing of the latest announcements, events, and blog posts. Content here is pulled dynamically from the database.
6. **Contact (`/contact`)**: A form to send inquiries and messages to the academy's administration.

## Administrative Dashboard (CMS)

The secure backend requires authentication and allows administrators to manage the school's data.

1. **Dashboard (`/admin/dashboard`)**: 
   - Provides a high-level overview of total applications, enrolled students, posts, and messages.
   - Displays a feed of recent activities.
   - Features a **"Reset Data for Live Production"** utility block to permanently wipe placeholder or test data out of the system before the site goes live.

2. **Applications Management (`/admin/applications`)**: 
   - Review submitted student applications.
   - Update application statuses (Pending, Approved, Rejected).

3. **Student Registry (`/admin/students`)**: 
   - A robust directory containing all officially registered students.
   - Securely manage student records, passports, and contact details.

4. **Blog / News CMS (`/admin/posts`)**: 
   - Create, edit, and delete news announcements.
   - Direct image upload integration (to Supabase Storage) with automatic canvas-based compression and base64 string fallback mechanisms if online storage limits are exceeded.

5. **Inbox / Contacts (`/admin/contacts`)**: 
   - View, reply to, and archive messages sent from the public Contact page.

## Database Schema (Supabase)

The core database consists of the following primary tables (secured with Row Level Security - RLS policies):
- `applications`: Stores admission forms (student info, parent details, grades).
- `registered_students`: Official list of enrolled students.
- `contacts`: Messages and inquiries from the public portal.
- `posts`: Blog and news articles, including image URLs, excerpts, and rich content.

**Storage Buckets:**
- `blog-images`: For storing cover images of news posts.
- `student-passports`: For storing uploaded photos of students during registry.

## Local Fallback Mechanism
To ensure continuous operation and an uninterrupted user experience, the application includes a hybrid data model:
- Write actions attempt a network request to Supabase.
- If the request times out or the database limit is exceeded (e.g. large images), the system seamlessly falls back to saving the data in `localStorage`.
- Read operations intelligently merge data fetched from the backend with data stored locally, filtering out duplicates to present unified arrays.

## Developer Guide & Deployment

### Environment Setup
Create a `.env` file in the root directory and ensure the following variables are defined:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Startup Commands
- Development server: `npm run dev`
- Production build: `npm run build`
- Linter: `npm run lint`

### Preparing for Live Production
Before launching the application to actual users:
1. Ensure your Supabase account limits are appropriately provisioned for real traffic and storage (especially the `blog-images` and `student-passports` storage buckets).
2. Login to the Admin section.
3. On the Dashboard, click **"Reset Data for Live Production"** to purge all test applications, fake students, and dummy blog posts from both the database and the browser's local storage.
4. Add actual academic sessions, real announcements, and legitimate data to the CMS.
