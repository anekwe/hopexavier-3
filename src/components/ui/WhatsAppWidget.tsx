import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
    recipient: '2348034045610'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Spam Protection / Dummy Data Validation
    const isDummyData = (str: string) => {
      const lower = str.toLowerCase().trim();
      if (lower.length < 2) return true;
      if (lower === 'test' || lower === 'dummy' || lower === 'none' || lower === 'nil') return true;
      if (/^(.)\1+$/.test(lower)) return true; // e.g., "xx", "yyy"
      return false;
    };

    if (isDummyData(formData.name)) {
      toast.error('Please enter a valid name.');
      return;
    }

    if (formData.phone.length < 5) {
      toast.error('Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    
    // Use the selected WhatsApp number
    const targetNumber = formData.recipient; 
    const textMessage = `Hello hopexavier first academy,\n\nName: ${formData.name}\nPhone: ${formData.phone}\nMessage: ${formData.message}`;

    // Fix: Open WhatsApp immediately before async operations to prevent browser popup blockers.
    const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent(textMessage)}`;
    window.open(whatsappUrl, '_blank');

    try {
      // User specifically requested the "message" table for the WhatsApp widget data
      const { error } = await supabase
        .from('messages')
        .insert([{ 
           name: formData.name, 
           phone: formData.phone, 
           message: formData.message 
        }]);
      
      if (error) {
         // Fallback to contacts if messages table doesn't exist
         await supabase.from('contacts').insert([{ 
            name: formData.name, 
            phone: formData.phone, 
            email: 'whatsapp@hopexavier.com',
            message: formData.message 
         }]);
      }
      
      toast.success('Opening WhatsApp...');
      setFormData({ name: '', phone: '', message: '', recipient: '2348034045610' });
      setIsOpen(false);
    } catch (error: any) {
      console.error(error);
      // We don't want to show an error if WhatsApp opened successfully
      // Just log it
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white border rounded-2xl shadow-xl w-[320px] mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-brand-green p-4 flex justify-between items-center text-white">
            <h3 className="font-bold flex items-center gap-2">
              <Phone className="h-5 w-5" /> Chat with Us
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-brand-pink transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="wa-recipient" className="text-xs">Department / Contact</Label>
                <select 
                  id="wa-recipient" 
                  name="recipient" 
                  value={formData.recipient} 
                  onChange={handleChange} 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="2348034045610">Reception / Admin (08034045610)</option>
                  <option value="2348036987095">Management (08036987095)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="wa-name" className="text-xs">Name</Label>
                <Input required id="wa-name" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" className="h-9 text-sm" />
              </div>
              <div>
                <Label htmlFor="wa-phone" className="text-xs">Phone</Label>
                <Input required type="tel" id="wa-phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Your Phone" className="h-9 text-sm" />
              </div>
              <div>
                <Label htmlFor="wa-message" className="text-xs">Message</Label>
                <Textarea required id="wa-message" name="message" value={formData.message} onChange={handleChange} placeholder="How can we help you?" className="min-h-[80px] text-sm" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold transition-colors">
                {loading ? 'Processing...' : 'Start Chat'}
              </Button>
            </form>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => {
          if (isAdmin) return;
          setIsOpen(!isOpen);
        }}
        className={`h-16 w-16 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full flex items-center justify-center shadow-lg transition-transform ${isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 animate-bounce cursor-pointer'}`}
        disabled={isAdmin}
        title={isAdmin ? 'WhatsApp bot is disabled for admins' : ''}
      >
        {isOpen ? <X className="h-8 w-8" /> : <Phone className="h-8 w-8" />}
      </button>
    </div>
  );
}
