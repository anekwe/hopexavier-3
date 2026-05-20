import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Settings() {
  const [marqueeText, setMarqueeText] = useState(() => {
    return localStorage.getItem('local_marquee_text') || 'hopexavier first academy - GUITA COMMUNITY, BWARI AREA COUNCIL,FCT ABUJA - ADMISSION ONGOING 2026/2027';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'marquee_text')
        .single();
      
      if (error) throw error;
      if (data && data.value) {
        setMarqueeText(data.value);
      }
    } catch (error: any) {
      if (error.code !== 'PGRST116') { // PGRST116 is "Rows not found" which is fine
        console.error('Fetch Settings Error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'marquee_text', value: marqueeText }], { onConflict: 'key' });
        
      if (error) {
        throw error;
      }
      
      window.dispatchEvent(new Event('marqueeUpdated'));
      toast.success('Marquee text updated successfully!');
    } catch (error: any) {
      console.error('Save Settings Error:', error);
      if (error?.code === '42P01' || error?.code === 'PGRST205' || (error?.message && error?.message?.includes("does not exist"))) {
        toast.error('Table missing! Please run the supabase_setup.sql script in your Supabase SQL Editor.', { duration: 10000 });
      } else if (error?.code === '42501' || error?.message?.includes("row-level security")) {
        toast.error('Permission denied! Please update your RLS policies in Supabase using the latest setup script.', { duration: 10000 });
      } else {
        toast.error(`Failed to save settings centrally: ${error?.message || 'Unknown error'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Site Settings</h1>
        <p className="text-muted-foreground">Manage global settings like the website marquee text.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="marqueeText">News / Marquee Text</Label>
            <Input 
              id="marqueeText" 
              placeholder="e.g. ADMISSION ONGOING 2026/2027..." 
              value={marqueeText} 
              onChange={(e) => setMarqueeText(e.target.value)} 
            />
            <p className="text-xs text-muted-foreground">This text will be scrolling at the top bar of the website.</p>
          </div>
          
          <Button type="submit" disabled={loading || isSubmitting} className="bg-brand-pink text-white hover:bg-brand-pink/90 cursor-pointer disabled:cursor-not-allowed transition-colors font-semibold">
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </div>
    </div>
  );
}
