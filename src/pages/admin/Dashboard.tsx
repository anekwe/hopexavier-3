import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Mailbox, Activity, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Dashboard() {
  const [stats, setStats] = useState({
    applications: 0,
    jobApplications: 0,
    students: 0,
    posts: 0,
    contacts: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      // Clear localStorage defaults used in this app
      const keys = ['local_applications', 'local_job_applications', 'local_contacts', 'local_students', 'local_posts', 'site_content', 'appData_local', 'formData_local'];
      keys.forEach(k => localStorage.removeItem(k));

      // Attempt to clear from Supabase db (deletes all rows for valid UUIDs)
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      await Promise.allSettled([
        supabase.from('applications').delete().neq('id', fakeUuid),
        supabase.from('job_applications').delete().neq('id', fakeUuid),
        supabase.from('registered_students').delete().neq('id', fakeUuid),
        supabase.from('posts').delete().neq('id', fakeUuid),
        supabase.from('contacts').delete().neq('id', fakeUuid),
      ]);

      toast.success('All testing data has been wiped successfully for production!');
      setOpenDialog(false);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (e: any) {
      toast.error('Failed to reset data: ' + e.message);
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const timeout = (ms: number) => new Promise<{ count: number, data: any[] | null }>((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));
        
        const safeFetch = async (promise: any) => {
           try {
              const res = await Promise.race([promise, timeout(10000)]);
              return res || { count: 0, data: [] };
           } catch (e) {
              return { count: 0, data: [] };
           }
        };

        const [appRes, jobAppRes, stuRes, postRes, contRes] = await Promise.all([
          safeFetch(supabase.from('applications').select('*', { count: 'exact', head: true })),
          safeFetch(supabase.from('job_applications').select('*', { count: 'exact', head: true })),
          safeFetch(supabase.from('registered_students').select('*', { count: 'exact', head: true })),
          safeFetch(supabase.from('posts').select('*', { count: 'exact', head: true })),
          safeFetch(supabase.from('contacts').select('*', { count: 'exact', head: true }))
        ]);

        const activities: any[] = [];
        let localApps: any[] = [];
        let localJobApps: any[] = [];
        let localContacts: any[] = [];
        let localStudents: any[] = [];
        let localPosts: any[] = [];

        try {
           localApps = JSON.parse(localStorage.getItem('local_applications') || '[]');
           localJobApps = JSON.parse(localStorage.getItem('local_job_applications') || '[]');
           localContacts = JSON.parse(localStorage.getItem('local_contacts') || '[]');
           localStudents = JSON.parse(localStorage.getItem('local_students') || '[]');
           localPosts = JSON.parse(localStorage.getItem('local_posts') || '[]');
        } catch(e) {}

        const dbAppCount = appRes?.count || 0;
        const dbJobAppCount = jobAppRes?.count || 0;
        const dbStuCount = stuRes?.count || 0;
        const dbPostCount = postRes?.count || 0;
        const dbContCount = contRes?.count || 0;

        setStats({
          applications: Math.max(dbAppCount, localApps.length + dbAppCount),
          jobApplications: Math.max(dbJobAppCount, localJobApps.length + dbJobAppCount),
          students: Math.max(dbStuCount, localStudents.length + dbStuCount),
          posts: Math.max(dbPostCount, localPosts.length + dbPostCount),
          contacts: Math.max(dbContCount, localContacts.length + dbContCount),
        });

        // Also fetch recent applications and contacts
        const [recentApps, recentJobApps, recentContacts] = await Promise.all([
          safeFetch(supabase.from('applications').select('id, created_at, student_fname, student_surname, class_applied').order('created_at', { ascending: false }).limit(3)),
          safeFetch(supabase.from('job_applications').select('id, created_at, surname, other_names, job_category').order('created_at', { ascending: false }).limit(3)),
          safeFetch(supabase.from('contacts').select('id, created_at, name, message').order('created_at', { ascending: false }).limit(3))
        ]);

        const combinedApps = [...localApps, ...(recentApps.data || [])];
        const combinedJobApps = [...localJobApps, ...(recentJobApps.data || [])];
        const combinedContacts = [...localContacts, ...(recentContacts.data || [])];

        // Merge and sort
        if (combinedApps.length > 0) {
           activities.push(...combinedApps.map((app: any) => ({
             id: `app_${app.id}`,
             type: 'application',
             title: 'New Student Application',
             description: `${app.student_fname} ${app.student_surname} applied for ${app.class_applied}`,
             created_at: new Date(app.created_at || Date.now())
           })));
        }
        if (combinedJobApps.length > 0) {
           activities.push(...combinedJobApps.map((app: any) => ({
             id: `jobapp_${app.id}`,
             type: 'job_application',
             title: 'New Job Application',
             description: `${app.surname} ${app.other_names} applied for ${app.job_category}`,
             created_at: new Date(app.created_at || Date.now())
           })));
        }
        if (combinedContacts.length > 0) {
           activities.push(...combinedContacts.map((msg: any) => ({
             id: `msg_${msg.id}`,
             type: 'message',
             title: 'New Contact Message',
             description: `Message from ${msg.name}`,
             created_at: new Date(msg.created_at || Date.now())
           })));
        }

        activities.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
        setRecentActivities(activities.slice(0, 5));

      } catch (e) {
        console.error("Error fetching stats:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Applications', value: stats.applications, icon: FileText, color: 'text-brand-green', bg: 'bg-brand-green/10' },
    { title: 'Job Applications', value: stats.jobApplications, icon: Users, color: 'text-brand-pink', bg: 'bg-brand-pink/10' },
    { title: 'Total Students', value: stats.students, icon: Users, color: 'text-brand-pink', bg: 'bg-brand-pink/10' },
    { title: 'Blog Posts', value: stats.posts, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'New Messages', value: stats.contacts, icon: Mailbox, color: 'text-brand-pink', bg: 'bg-brand-pink/10' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Overview</h1>
          <p className="text-muted-foreground">Monitor the latest activities and statistics for hopexavier first academy.</p>
        </div>
        
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="group cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
              Reset Data for Live Production
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-500 flex items-center gap-2">
                <Trash2 className="h-5 w-5" /> Wipe Testing Data
              </DialogTitle>
              <DialogDescription>
                Are you sure? This will permanently delete all the locally saved and database testing data for:
                <ul className="list-disc pl-6 mt-2 mb-2 font-medium">
                  <li>Applications</li>
                  <li>Job Applications</li>
                  <li>Registered Students</li>
                  <li>Blog / News Posts</li>
                  <li>Contacts / Messages</li>
                </ul>
                This action is irreversible and should only be used to clear out test data before live production.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button variant="outline" onClick={() => setOpenDialog(false)} disabled={resetting}>Cancel</Button>
              <Button variant="destructive" onClick={handleReset} disabled={resetting}>
                {resetting ? 'Resetting...' : 'Yes, Delete All Data'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card, i) => (
          <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                 <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? '...' : card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-xl font-bold tracking-tight mt-10 mb-4">Recent Activity</h2>
      <Card className="border-none shadow-sm rounded-2xl">
         <CardContent className="p-0">
            <div className="divide-y divide-border">
               {loading ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">Loading...</div>
               ) : recentActivities.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">No recent activity.</div>
               ) : (
                  recentActivities.map((activity) => (
                     <div key={activity.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                           {activity.type === 'application' ? (
                              <div className="h-10 w-10 min-w-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green"><FileText className="h-5 w-5" /></div>
                           ) : activity.type === 'job_application' ? (
                              <div className="h-10 w-10 min-w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Users className="h-5 w-5" /></div>
                           ) : (
                              <div className="h-10 w-10 min-w-10 rounded-full bg-brand-pink/10 flex items-center justify-center text-brand-pink"><Mailbox className="h-5 w-5" /></div>
                           )}
                           <div className="truncate pr-4">
                              <p className="text-sm font-medium">{activity.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                           </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                           {activity.created_at.toLocaleDateString()}
                        </span>
                     </div>
                  ))
               )}
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
