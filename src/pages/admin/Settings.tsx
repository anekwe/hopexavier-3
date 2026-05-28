import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { queryWithTimeout } from '@/lib/utils/supabase-timeout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trash2, Plus, Edit2, Check, X as XIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function Settings() {
  const [marquees, setMarquees] = useState<{id: string, text: string, active: boolean}[]>([
    { id: '1', text: 'hopexavier first academy - GUITA COMMUNITY, BWARI AREA COUNCIL,FCT ABUJA - ADMISSION ONGOING 2026/2027', active: true }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newMarquee, setNewMarquee] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await queryWithTimeout(supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'marquees_json')
        .single());
      
      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.value) {
        try {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed)) {
            setMarquees(parsed);
          }
        } catch (e) {
          console.error("Failed to parse marquees", e);
        }
      }
    } catch (error: any) {
      if (error.code !== 'PGRST116') console.error('Fetch Settings Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    if (supabase) {
      const channel = supabase
        .channel('site_settings_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => {
          fetchSettings();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, []);

  const saveMarquees = async (newMarquees: any[]) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'marquees_json', value: JSON.stringify(newMarquees) }], { onConflict: 'key' });
        
      if (error) throw error;
      
      setMarquees(newMarquees);
      window.dispatchEvent(new Event('marqueeUpdated'));
      toast.success('Marquees updated successfully!');
    } catch (error: any) {
       console.error('Save Settings Error:', error);
       toast.error(`Failed to save settings centrally: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMarquee = () => {
    if (!newMarquee.trim()) return;
    const item = { id: Date.now().toString(), text: newMarquee.trim(), active: true };
    saveMarquees([...marquees, item]);
    setNewMarquee('');
  };

  const handleDelete = (id: string) => {
    saveMarquees(marquees.filter(m => m.id !== id));
  };

  const handleToggleActive = (id: string, active: boolean) => {
    saveMarquees(marquees.map(m => m.id === id ? { ...m, active } : m));
  };

  const startEditing = (id: string, text: string) => {
    setEditingId(id);
    setEditValue(text);
  };

  const saveEditing = (id: string) => {
    if (!editValue.trim()) return;
    saveMarquees(marquees.map(m => m.id === id ? { ...m, text: editValue.trim() } : m));
    setEditingId(null);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Site Settings</h1>
        <p className="text-muted-foreground">Manage global settings like the website marquee text.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Scrolling Announcements (Marquees)</h2>
          
          <div className="space-y-4 mb-6">
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading marquees...</p>
            ) : marquees.length === 0 ? (
              <p className="text-muted-foreground text-sm">No marquees added yet.</p>
            ) : (
              marquees.map((m) => (
                <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg bg-slate-50/50">
                   {editingId === m.id ? (
                      <div className="flex-1 flex gap-2 w-full">
                         <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1" />
                         <Button onClick={() => saveEditing(m.id)} size="icon" variant="ghost" className="text-green-600"><Check className="h-4 w-4" /></Button>
                         <Button onClick={() => setEditingId(null)} size="icon" variant="ghost" className="text-red-500"><XIcon className="h-4 w-4" /></Button>
                      </div>
                   ) : (
                      <div className="flex-1">
                        <p className={`text-sm ${!m.active && 'opacity-50 line-through'}`}>{m.text}</p>
                      </div>
                   )}
                   
                   {editingId !== m.id && (
                     <div className="flex items-center gap-4 shrink-0">
                        <div className="flex items-center space-x-2">
                           <Switch id={`active-${m.id}`} checked={m.active} onCheckedChange={(c) => handleToggleActive(m.id, c)} />
                           <Label htmlFor={`active-${m.id}`} className="text-xs">Active</Label>
                        </div>
                        <Button onClick={() => startEditing(m.id, m.text)} size="icon" variant="ghost" className="h-8 w-8 text-blue-500"><Edit2 className="h-4 w-4" /></Button>
                        <Button onClick={() => handleDelete(m.id)} size="icon" variant="ghost" className="h-8 w-8 text-red-500"><Trash2 className="h-4 w-4" /></Button>
                     </div>
                   )}
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="newMarquee">Add New Marquee</Label>
            <div className="flex gap-2">
              <Input 
                id="newMarquee" 
                placeholder="e.g. IMPORTANT NOTICE: Parents teachers meeting..." 
                value={newMarquee} 
                onChange={(e) => setNewMarquee(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleAddMarquee()}
              />
              <Button onClick={handleAddMarquee} disabled={isSubmitting || !newMarquee.trim()} className="bg-brand-pink text-white hover:bg-brand-pink/90">
                <Plus className="h-4 w-4 mr-2" /> Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
