/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';
import RootLayout from '@/components/layout/RootLayout';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Services from './pages/public/Services';
import Blog from './pages/public/Blog';
import BlogPost from './pages/public/BlogPost';
import Contact from './pages/public/Contact';
import Apply from './pages/public/Apply';

import { AuthProvider } from '@/lib/AuthContext';
import AdminLayout from '@/components/layout/AdminLayout';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Applications from './pages/admin/Applications';
import Students from './pages/admin/Students';
import Posts from './pages/admin/Posts';
import Contacts from './pages/admin/Contacts';
import RegisterStudent from './pages/admin/RegisterStudent';
import Settings from './pages/admin/Settings';
import AdminJobs from './pages/admin/Jobs';
import AdminStaff from './pages/admin/Staff';
import RegisterStaff from './pages/admin/RegisterStaff';
import WhatsappIntegration from './pages/admin/WhatsappIntegration';
import WhatsAppWidget from './components/ui/WhatsAppWidget';
import Jobs from './pages/public/Jobs';
import JobStatus from './pages/public/JobStatus';

import { Toaster } from 'sonner';

export default function App() {
  return (
    <AuthProvider>
      {/* Global Background Watermark */}
      <div 
        className="fixed inset-0 z-50 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'url("https://i.ibb.co/mrtDMPDF/p2.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <BrowserRouter>
        <ScrollToTop />
        <WhatsAppWidget />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:id" element={<BlogPost />} />
            <Route path="contact" element={<Contact />} />
            <Route path="apply" element={<Apply />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/status" element={<JobStatus />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<Login />} />
          <Route path="/admin/dashboard" element={<AdminLayout />}>
             <Route index element={<Dashboard />} />
             <Route path="applications" element={<Applications />} />
             <Route path="students" element={<Students />} />
             <Route path="students/new" element={<RegisterStudent />} />
             <Route path="staff" element={<AdminStaff />} />
             <Route path="staff/new" element={<RegisterStaff />} />
             <Route path="jobs" element={<AdminJobs />} />
             <Route path="posts" element={<Posts />} />
             <Route path="contacts" element={<Contacts />} />
             <Route path="settings" element={<Settings />} />
             <Route path="whatsapp" element={<WhatsappIntegration />} />
          </Route>
        </Routes>
        <Toaster richColors position="top-center" />
      </BrowserRouter>
    </AuthProvider>
  );
}
