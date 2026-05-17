import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button, buttonVariants } from '@/components/ui/button';
import { Menu, X, Phone, Mail, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [marqueeText, setMarqueeText] = useState('hopexavier first academy - GUITA COMMUNITY, BWARI AREA COUNCIL,FCT ABUJA - ADMISSION ONGOING 2026/2027');

  useEffect(() => {
    const fetchMarquee = async () => {
      try {
        const dbPromise = supabase.from('site_settings').select('*').eq('key', 'marquee_text').single();
        const timeoutPromise = new Promise<{ data: any, error: any }>((resolve) => setTimeout(() => resolve({ data: null, error: new Error('TIMEOUT') }), 5000));
        const res: any = await Promise.race([dbPromise, timeoutPromise]);
        
        let loaded = false;
        if (res.data && res.data.value) {
           setMarqueeText(res.data.value);
           loaded = true;
        } else if (res.error && res.error.message !== 'TIMEOUT' && res.error.code !== 'PGRST116') {
           console.warn("Could not fetch marquee text from Supabase:", res.error);
        }

        if (!loaded) {
           const localText = localStorage.getItem('local_marquee_text');
           if (localText) setMarqueeText(localText);
        }
      } catch (error) {
        // Fallback to local storage if DB fails
        const localText = localStorage.getItem('local_marquee_text');
        if (localText) setMarqueeText(localText);
      }
    };
    
    fetchMarquee();

    const handleLocalUpdate = () => {
        const localText = localStorage.getItem('local_marquee_text');
        if (localText) setMarqueeText(localText);
    };

    window.addEventListener('marqueeUpdated', handleLocalUpdate);
    return () => window.removeEventListener('marqueeUpdated', handleLocalUpdate);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Blog & News', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-brand-green text-white py-2 px-4 text-sm hidden lg:block relative z-50">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
            <Phone className="h-4 w-4" />
            <span>08036987095, 08164724449</span>
          </div>
          
          <div className="w-full relative overflow-hidden flex-1 px-8 bg-white rounded-full h-8 flex items-center shadow-inner">
            <div className="animate-marquee inline-block whitespace-nowrap text-[#FF007F] font-bold uppercase tracking-wider">
              {marqueeText}
            </div>
          </div>

          <div className="flex items-center gap-4 whitespace-nowrap shrink-0">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>hopexavierfirstacademy@gmail.com</span>
            </div>
            <div className="font-bold border-l pl-4 border-white/30 hidden xl:block text-[10px] sm:text-xs">
               WAEC APPROVED, NECO APPROVED, NABTEB APPROVED, JAMB APPROVED.
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Top Bar */}
      <div className="bg-white py-2 px-4 text-xs block lg:hidden relative z-50 overflow-hidden border-b border-brand-green/20 shadow-inner">
        <div className="animate-marquee inline-block whitespace-nowrap text-[#FF007F] font-bold uppercase tracking-wider">
          {marqueeText}
        </div>
      </div>

      <header className="sticky top-0 z-40 w-full border-b bg-pink-50/95 backdrop-blur supports-[backdrop-filter]:bg-pink-50/60">
      <div className="container mx-auto px-4 lg:px-8 h-24 md:h-20 flex items-center justify-between relative">
        <Link to="/" className="flex flex-1 md:flex-none justify-center md:justify-start items-center shrink-0">
          <img src="https://i.ibb.co/mrtDMPDF/p2.png" alt="hopexavier first academy" className="h-28 md:h-20 lg:h-28 w-auto drop-shadow-sm object-contain" />
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`text-sm font-medium transition-colors hover:text-brand-green ${location.pathname === link.path ? 'text-brand-green' : 'text-muted-foreground'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-brand-green transition-colors" title="Admin">
            <Settings className="h-5 w-5" />
          </Link>
          <Link to="/jobs" className="text-sm font-medium text-black hover:text-brand-green transition-colors">Jobs</Link>
          <Link to="/apply" className={buttonVariants({ className: "bg-brand-pink text-brand-green hover:bg-brand-pink/60 hover:text-brand-green/60 font-semibold rounded-full px-6 transition-colors" })}>
            Apply Now
          </Link>
        </nav>

        {/* Mobile Nav Toggle */}
        <button className="md:hidden p-2 absolute right-4 text-brand-green" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-pink-100">
          <nav className="flex flex-col p-4 bg-pink-50 space-y-4 items-center text-center">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`text-sm font-medium w-full py-2 rounded-md transition-colors ${location.pathname === link.path ? 'bg-brand-pink/20 text-brand-green' : 'text-foreground'} hover:bg-brand-pink hover:text-brand-green`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link to="/admin" onClick={() => setIsOpen(false)} className="text-sm font-medium text-foreground w-full py-2 flex justify-center rounded-md hover:bg-brand-pink hover:text-brand-green transition-colors" title="Admin">
              <Settings className="h-6 w-6" />
            </Link>
            <Link to="/jobs" onClick={() => setIsOpen(false)} className="text-sm font-medium w-full py-2 rounded-md text-black hover:bg-brand-pink hover:text-brand-green transition-colors">Jobs</Link>
            <Link to="/apply" onClick={() => setIsOpen(false)} className={buttonVariants({ className: "bg-brand-pink text-brand-green hover:bg-brand-pink/60 hover:text-brand-green/60 w-full transition-colors font-semibold" })}>
              Apply Now
            </Link>
          </nav>
        </div>
      )}
    </header>
    </>
  );
}
