import { Outlet, Navigate, NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { LayoutDashboard, Users, UsersRound, FileWarning, LogOut, FileText, Menu, X, Mailbox, Settings as SettingsIcon, Shield, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout() {
  const { user, loading, signOut } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/admin" replace />; // Redirect to login if not authenticated

  const navItems = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'School Admissions', path: '/admin/dashboard/applications', icon: FileWarning },
    { name: 'Job Applications', path: '/admin/dashboard/jobs', icon: Users },
    { name: 'Students', path: '/admin/dashboard/students', icon: UsersRound },
    { name: 'Staff', path: '/admin/dashboard/staff', icon: Shield },
    { name: 'Blog/News', path: '/admin/dashboard/posts', icon: FileText },
    { name: 'Enquiries', path: '/admin/dashboard/contacts', icon: Mailbox },
    { name: 'Settings', path: '/admin/dashboard/settings', icon: SettingsIcon },
    { name: 'WhatsApp Bot', path: '/admin/dashboard/whatsapp', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-transparent overflow-hidden font-sans">
      
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`bg-brand-dark-green text-white transition-transform duration-300 flex flex-col fixed md:relative h-full w-64 z-30 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shrink-0 shadow-xl`}
      >
        <div className="p-4 border-b border-white/10 flex justify-between items-center h-16 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <Shield className="h-5 w-5 text-brand-pink shrink-0" />
            <span className="font-bold text-brand-pink whitespace-nowrap overflow-hidden text-ellipsis">Admin Portal</span>
          </div>
          <button className="md:hidden text-white hover:text-brand-pink" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path} 
                  end={item.path === '/admin/dashboard'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-sm transition-colors font-medium rounded-lg shadow-sm ${isActive ? 'bg-[#FAED26] text-black' : 'bg-[#4B5320] text-white hover:bg-[#FAED26] hover:text-black'}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-white/10 shrink-0">
          <button onClick={signOut} className="flex items-center gap-3 text-sm text-brand-pink hover:text-brand-green transition-colors w-full px-2 py-2">
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        {/* Top Header */}
        <header className="h-16 bg-white border-b flex items-center px-4 justify-between shrink-0 shadow-sm z-10 relative">
          <div className="flex-1 flex items-center">
            <button className="text-gray-500 hover:text-brand-dark-green p-2 md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
          </div>
          
          {/* Center Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <Link to="/admin/dashboard" className="block outline-none opacity-90 hover:opacity-100 transition-opacity">
              <img src="https://i.ibb.co/mrtDMPDF/p2.png" alt="hopexavier first academy" className="h-12 w-auto object-contain" />
            </Link>
          </div>
          
          <div className="flex-1 flex justify-end items-center gap-4 text-sm font-medium">
             <Link to="/" className="text-muted-foreground hover:text-brand-green hidden sm:inline-block">View Site</Link>
             <span className="bg-brand-green/10 text-brand-green px-3 py-1.5 rounded-full text-xs flex items-center max-w-[200px] truncate">
               {user?.email || 'Admin'}
             </span>
          </div>
        </header>

        {/* Dashboard Pages */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
