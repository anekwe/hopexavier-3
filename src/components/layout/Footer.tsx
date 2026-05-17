import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-brand-green text-yellow-400 py-12">
      <div className="container mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <img src="https://i.ibb.co/mrtDMPDF/p2.png" alt="hopexavier first academy" className="h-20 w-auto mb-4" />
          <p className="text-sm text-left">
            Raising Future Leaders with Excellence and Character in Abuja, Nigeria.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="text-black hover:text-pink-300 transition-colors">About Us</Link></li>
            <li><Link to="/services" className="text-black hover:text-pink-300 transition-colors">Academic Programs</Link></li>
            <li><Link to="/apply" className="text-black hover:text-pink-300 transition-colors">Apply Now</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li>Guita Community, Bwarri Area Council, FCT-Abuja, Nigeria.</li>
            <li>hopexavierfirstacademy@gmail.com</li>
            <li>+234 8036987095</li>
            <li>+234 8164724449</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Portal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/admin" className="text-black hover:text-pink-300 transition-colors">Admin Login</Link></li>
            <li><Link to="/contact" className="text-black hover:text-pink-300 transition-colors">Help & Support</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-8 mt-8 border-t border-yellow-400/20 pt-8 flex flex-col items-center gap-4 text-sm">
        <p className="text-center">&copy; {new Date().getFullYear()} hopexavier first academy. All rights reserved.</p>
        <div className="bg-black text-white px-4 py-1.5 rounded-full text-xs tracking-wide">
          Design By ogeTECH concepts Ltd
        </div>
      </div>
    </footer>
  );
}
