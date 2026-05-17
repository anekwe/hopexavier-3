import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { MapPin, Phone, Mail, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    
    const textMessage = `New Contact Form Submission:\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nMessage: ${formData.message}`;
    const whatsappUrl = `https://wa.me/2348036987095?text=${encodeURIComponent(textMessage)}`;

    // Open WhatsApp synchronously to bypass popup blockers
    try {
      const win = window.open(whatsappUrl, '_blank');
      if (!win) {
        window.location.href = whatsappUrl;
      }
    } catch (e) {
      window.location.href = whatsappUrl;
    }

    toast.success('Message sent! WhatsApp opened.');

    // Save data in the background
    (async () => {
      try {
        if (supabase) {
          const timeoutPromise = new Promise<{ error: any }>((_, reject) => 
            setTimeout(() => reject(new Error("Network timeout: Supabase unreachable")), 10000)
          );
          const dbPromise = supabase.from('contacts').insert([formData]);
          const result: any = await Promise.race([dbPromise, timeoutPromise]);
          if (result && result.error) throw result.error;
        }
      } catch (e) {
         console.warn("Supabase insert failed, relying on local storage", e);
      }
      
      const localContacts = JSON.parse(localStorage.getItem('local_contacts') || '[]');
      localContacts.push({ ...formData, id: `local_${Date.now()}`, created_at: new Date().toISOString() });
      localStorage.setItem('local_contacts', JSON.stringify(localContacts));
    })();

    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="py-20 lg:py-32">
      <div className="container px-4 lg:px-8 mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-16">
          
          <div>
            <h1 className="text-4xl font-bold mb-6 text-brand-green">Reach US</h1>
            <p className="text-muted-foreground mb-10 w-full max-w-md">
              Have questions about admissions, our curriculum, or facilities? Reach out to us, and our team will be happy to assist you.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-brand-green/10 p-3 rounded-full text-brand-green">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-brand-green">Our Address</h3>
                  <p className="text-muted-foreground">Guita Community, Bwarri Area Council,<br/>Abuja, Federal Capital Territory, Nigeria</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-brand-pink/10 p-3 rounded-full text-brand-pink">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-brand-green">Phone</h3>
                  <p className="text-muted-foreground">+234 8036987095<br/>+234 8164724449</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-brand-pink/10 p-3 rounded-full text-brand-pink">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-brand-green">Email</h3>
                  <p className="text-muted-foreground">hopexavierfirstacademy@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-brand-green/10 p-3 rounded-full text-brand-green">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-brand-green">Website Address</h3>
                  <p className="text-muted-foreground">hopexavierfirstacademy.com</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 bg-muted h-64 rounded-xl overflow-hidden relative">
               <iframe
                  src="https://maps.google.com/maps?q=Bwari%20Area%20Council,%20Abuja&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
               ></iframe>
            </div>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-lg border border-border/50">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-brand-green">Enquire From Us</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input required id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input required type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input required type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+234..." className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Your Message</Label>
                  <Textarea required id="message" name="message" value={formData.message} onChange={handleChange} placeholder="How can we help you?" className="min-h-[150px]" />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-12 bg-brand-pink text-white hover:bg-brand-pink/90 text-lg font-semibold transition-colors">
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
