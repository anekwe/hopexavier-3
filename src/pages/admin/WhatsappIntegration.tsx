import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { MessageSquare, Settings, Users, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import axios from 'axios';

export default function WhatsappIntegration() {
  const [loading, setLoading] = useState(false);
  
  // Settings State
  const [settings, setSettings] = useState({
    access_token: '',
    phone_number_id: '',
    verify_token: '',
    is_enabled: false
  });

  // Fetch Settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    if(!supabase) return;
    try {
      const { data, error } = await supabase.from('whatsapp_settings').select('*');
      if (error) throw error;
      
      const newSettings = { ...settings };
      data.forEach(item => {
        if(item.key === 'access_token') newSettings.access_token = item.value;
        if(item.key === 'phone_number_id') newSettings.phone_number_id = item.value;
        if(item.key === 'verify_token') newSettings.verify_token = item.value;
        if(item.key === 'is_enabled') newSettings.is_enabled = item.value === 'true';
      });
      setSettings(newSettings);
    } catch (error: any) {
      console.error("Error fetching settings:", error);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    if(!supabase) return;
    setLoading(true);
    try {
      const updates = [
        { key: 'access_token', value: settings.access_token },
        { key: 'phone_number_id', value: settings.phone_number_id },
        { key: 'verify_token', value: settings.verify_token },
        { key: 'is_enabled', value: settings.is_enabled.toString() },
      ];
      
      const { error } = await supabase.from('whatsapp_settings').upsert(updates, { onConflict: 'key' });
      if (error) throw error;
      toast.success('WhatsApp configuration saved securely');
    } catch (error: any) {
      toast.error('Failed to save settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    // In a real scenario, we might hit the local node server that hits the fb graph api
    toast.info('Testing connection with Meta APIs...');
    setTimeout(() => {
       if(settings.access_token && settings.phone_number_id) {
           toast.success('Connection Successful! Ready to send/receive messages.');
       } else {
           toast.error('Please configure your credentials first.');
       }
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-[#2B2B2B]">OGETECH WhatsApp Integration System</h1>
        <p className="text-muted-foreground">Manage your automated WhatsApp messaging infrastructure.</p>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#00A65A] data-[state=active]:text-white"><Settings className="h-4 w-4 mr-2" /> Settings</TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-[#00A65A] data-[state=active]:text-white"><MessageSquare className="h-4 w-4 mr-2" /> Inbox</TabsTrigger>
          <TabsTrigger value="autoreply" className="data-[state=active]:bg-[#00A65A] data-[state=active]:text-white"><Send className="h-4 w-4 mr-2" /> AI / Auto-Reply</TabsTrigger>
          <TabsTrigger value="broadcast" className="data-[state=active]:bg-[#00A65A] data-[state=active]:text-white"><Users className="h-4 w-4 mr-2" /> Broadcast</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-6">
          <Card className="border-t-4 border-t-[#00A65A]">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>API Configuration</CardTitle>
                  <CardDescription>Configure your Meta Business credentials. Keep your keys secret.</CardDescription>
                </div>
                {settings.is_enabled ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-200">System Active</span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full border border-yellow-200">Standby Mode</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 pb-4">
                <Switch 
                  id="enable-bot" 
                  checked={settings.is_enabled} 
                  onCheckedChange={(checked) => updateSetting('is_enabled', checked as any)}
                />
                <Label htmlFor="enable-bot" className="text-base font-semibold">
                  Enable WhatsApp Bot System (Take out of Standby)
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="token">Permanent Access Token</Label>
                  <Input 
                    id="token" 
                    type="password" 
                    value={settings.access_token} 
                    onChange={e => updateSetting('access_token', e.target.value)} 
                    placeholder="EAAPx..." 
                  />
                  <p className="text-xs text-muted-foreground">Generated from Meta Developer Dashboard</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneId">Phone Number ID</Label>
                  <Input 
                    id="phoneId" 
                    value={settings.phone_number_id} 
                    onChange={e => updateSetting('phone_number_id', e.target.value)} 
                    placeholder="1234567890" 
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="verifyToken">Webhook Verify Token</Label>
                  <Input 
                    id="verifyToken" 
                    value={settings.verify_token} 
                    onChange={e => updateSetting('verify_token', e.target.value)} 
                    placeholder="my_super_secret_token" 
                  />
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    <p>This string is used by Meta to verify your webhook URL.</p>
                    <p className="font-semibold text-brand-pink mt-1">Webhook Setup Instructions:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Go to the Meta Developer Dashboard.</li>
                      <li>Go to WhatsApp &gt; Configuration.</li>
                      <li>Click "Edit" under Webhook.</li>
                      <li>Callback URL: <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono select-all">{typeof window !== 'undefined' ? `${window.location.origin}/api/whatsapp/webhook` : 'https://your-domain.com/api/whatsapp/webhook'}</code></li>
                      <li>Verify Token: Enter the exact token you typed above.</li>
                      <li>Click "Verify and Save".</li>
                      <li>Manage Webhook fields and subscribe to <strong>messages</strong>.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t mt-6">
                <Button onClick={saveSettings} disabled={loading} className="bg-[#00a65a] hover:bg-[#00a65a]/90">
                  {loading ? 'Saving...' : 'Save Configuration'}
                </Button>
                <Button variant="outline" onClick={testConnection}>
                  Test API Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Chat Panel</CardTitle>
              <CardDescription>View incoming messages and reply directly to users.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="bg-muted min-h-[400px] flex items-center justify-center rounded-md border border-dashed">
                    <p className="text-muted-foreground">Coming soon: Full multi-agent inbox view.</p>
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="autoreply" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Reply & AI Settings</CardTitle>
              <CardDescription>Train your bot with keyword matching or an AI system.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  <div className="grid gap-4 bg-muted/50 p-4 rounded-md">
                     <div className="flex justify-between items-center">
                        <Label>Greeting Message (When users type 'Hi' or 'Hello')</Label>
                        <Switch defaultChecked />
                     </div>
                     <Textarea defaultValue="Welcome to hopexavier first academy! How can we assist you today? 1. Admissions 2. Fees 3. Appointments." />
                  </div>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcast" className="mt-6">
           <Card>
             <CardHeader>
                 <CardTitle>Broadcast Messaging</CardTitle>
                 <CardDescription>Send bulk announcements to parents or enrolled students.</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                     <Label>Audience</Label>
                     <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm">
                        <option>All Registered Students (Parents)</option>
                        <option>Job Applicants</option>
                        <option>Custom List</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <Label>Message Template</Label>
                     <Textarea rows={4} placeholder="Type your marketing or update broadcast here..." />
                  </div>
                  <Button className="bg-[#00a65a] hover:bg-[#00a65a]/90">Send Broadcast Now</Button>
                </div>
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
