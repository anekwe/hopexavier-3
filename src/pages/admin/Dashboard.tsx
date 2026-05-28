import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Mailbox, Activity, Trash2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    jobApplications: 0,
    pendingJobApplications: 0,
    approvedJobApplications: 0,
    students: 0,
    staff: 0,
    posts: 0,
    contacts: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [resetPin, setResetPin] = useState('');

  const handleReset = async () => {
    if (resetPin !== 'hopexavier_1986_nov') {
      toast.error('Not Authorized to do this!');
      return;
    }

    setResetting(true);
    try {
      const tablesToClear = ['applications', 'job_applications', 'registered_students', 'posts', 'contacts', 'messages'];
      
      for (const table of tablesToClear) {
         let hasMore = true;
         // Loop and delete in batches to bypass PostgreSQL mass-delete restrictions and UUID/int casting issues
         while (hasMore) {
            const { data, error } = await supabase.from(table).select('id').limit(1000);
            if (error) {
                console.warn(`Table ${table} error: ${error.message}`);
                hasMore = false;
                break; // Skip to next table
            }
            
            if (!data || data.length === 0) {
               hasMore = false;
               break;
            }
            
            const ids = data.map(r => r.id);
            const { error: delError } = await supabase.from(table).delete().in('id', ids);
            if (delError) {
                console.warn(`Delete failed on ${table}: ${delError.message}`);
                hasMore = false;
                break;
            }
         }
      }

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
    const fetchStats = async (showLoader = false) => {
      if (showLoader === true && !stats.applications) setLoading(true);
      try {
        if (!isSupabaseConfigured) {
           const localApps = JSON.parse(localStorage.getItem('hopexavier_mock_applications') || '[]');
           const localStudents = JSON.parse(localStorage.getItem('hopexavier_mock_students') || '[]');
           const localStaff = JSON.parse(localStorage.getItem('hopexavier_mock_staff') || '[]');
           const localJobs = JSON.parse(localStorage.getItem('hopexavier_mock_jobs') || '[]');
           
           const pendingAppsCount = localApps.filter((a: any) => (a.status || '').toLowerCase() === 'pending').length;
           const approvedAppsCount = localApps.filter((a: any) => (a.status || '').toLowerCase() === 'accepted').length;
           const rejectedAppsCount = localApps.filter((a: any) => (a.status || '').toLowerCase() === 'rejected').length;

           const pendingJobsCount = localJobs.filter((j: any) => (j.application_status || '').toLowerCase() === 'pending').length;
           const approvedJobsCount = localJobs.filter((j: any) => (j.application_status || '').toLowerCase() === 'employed').length;

           setStats({
             applications: localApps.length,
             pendingApplications: pendingAppsCount,
             approvedApplications: approvedAppsCount,
             rejectedApplications: rejectedAppsCount,
             jobApplications: localJobs.length,
             pendingJobApplications: pendingJobsCount,
             approvedJobApplications: approvedJobsCount,
             students: localStudents.length,
             staff: localStaff.length,
             posts: 2,
             contacts: 1
           });

           const activities: any[] = [];
           localApps.slice(0, 3).forEach((a: any) => {
             activities.push({
               id: `app-act-${a.id}`,
               title: 'Admissions Application',
               description: `${a.student_fname} ${a.student_surname} (${a.class_applied || 'N/A'}) is ${a.status || 'Pending'}`,
               created_at: new Date(a.created_at || Date.now()),
               type: 'application'
             });
           });
           localStudents.slice(0, 3).forEach((s: any) => {
             activities.push({
               id: `stu-act-${s.id}`,
               title: 'Student Registered',
               description: `${s.surname} ${s.other_names} (${s.registration_number})`,
               created_at: new Date(s.created_at || Date.now()),
               type: 'student'
             });
           });
           localStaff.slice(0, 3).forEach((st: any) => {
             activities.push({
               id: `st-act-${st.id}`,
               title: 'Staff Documented',
               description: `${st.surname} ${st.first_name} (${st.staff_number})`,
               created_at: new Date(st.created_at || Date.now()),
               type: 'staff'
             });
           });

           activities.sort((a,b) => b.created_at.getTime() - a.created_at.getTime());
           setRecentActivities(activities.slice(0, 5));
           setLoading(false);
           return;
        }
        const timeout = (ms: number) => new Promise<{ count: number, data: any[] | null }>((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));
        
        const safeFetch = async (promise: any) => {
           try {
              const res = await Promise.race([promise, timeout(10000)]);
              return res || { count: 0, data: [] };
           } catch (e) {
              return { count: 0, data: [] };
           }
        };

        const [
          appRes, appPendingRes, appApprovedRes, appRejectedRes,
          jobAppRes, jobAppPendingRes, jobAppApprovedRes,
          stuRes, staffRes,
          postRes, contRes
        ] = await Promise.all([
          safeFetch(supabase.from('applications').select('*', { count: 'exact', head: true })),
          safeFetch(supabase.from('applications').select('*', { count: 'exact', head: true }).ilike('status', '%pending%')),
          safeFetch(supabase.from('applications').select('*', { count: 'exact', head: true }).ilike('status', '%accepted%')),
          safeFetch(supabase.from('applications').select('*', { count: 'exact', head: true }).ilike('status', '%rejected%')),
          safeFetch(supabase.from('job_applications').select('*', { count: 'exact', head: true })),
          safeFetch(supabase.from('job_applications').select('*', { count: 'exact', head: true }).ilike('application_status', '%pending%')),
          safeFetch(supabase.from('job_applications').select('*', { count: 'exact', head: true }).ilike('application_status', '%approved%')),
          safeFetch(supabase.from('registered_students').select('*', { count: 'exact', head: true })),
          safeFetch(supabase.from('staff_documentation').select('*', { count: 'exact', head: true })),
          safeFetch(supabase.from('posts').select('*', { count: 'exact', head: true })),
          safeFetch(supabase.from('contacts').select('*', { count: 'exact', head: true }))
        ]);

        const activities: any[] = [];
        
        setStats({
          applications: appRes?.count || 0,
          pendingApplications: appPendingRes?.count || 0,
          approvedApplications: appApprovedRes?.count || 0,
          rejectedApplications: appRejectedRes?.count || 0,
          jobApplications: jobAppRes?.count || 0,
          pendingJobApplications: jobAppPendingRes?.count || 0,
          approvedJobApplications: jobAppApprovedRes?.count || 0,
          students: stuRes?.count || 0,
          staff: staffRes?.count || 0,
          posts: postRes?.count || 0,
          contacts: contRes?.count || 0,
        });

        // Also fetch recent applications, staff and contacts
        const [recentApps, recentJobApps, recentContacts, recentStudents, recentStaff] = await Promise.all([
          safeFetch(supabase.from('applications').select('id, created_at, student_fname, student_surname, class_applied').order('created_at', { ascending: false }).limit(3)),
          safeFetch(supabase.from('job_applications').select('id, created_at, surname, other_names, job_category').order('created_at', { ascending: false }).limit(3)),
          safeFetch(supabase.from('contacts').select('id, created_at, name, message').order('created_at', { ascending: false }).limit(3)),
          safeFetch(supabase.from('registered_students').select('id, created_at, surname, other_names, class_applied').order('created_at', { ascending: false }).limit(3)),
          safeFetch(supabase.from('staff_documentation').select('id, created_at, surname, first_name, job_category').order('created_at', { ascending: false }).limit(3))
        ]);

        const combinedApps = [...(recentApps.data || [])];
        const combinedJobApps = [...(recentJobApps.data || [])];
        const combinedContacts = [...(recentContacts.data || [])];
        const combinedStudents = [...(recentStudents.data || [])];
        const combinedStaff = [...(recentStaff.data || [])];

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
        if (combinedStudents.length > 0) {
           activities.push(...combinedStudents.map((app: any) => ({
             id: `student_${app.id}`,
             type: 'student',
             title: 'New Student Admission',
             description: `${app.surname} ${app.other_names} admitted to ${app.class_applied}`,
             created_at: new Date(app.created_at || Date.now())
           })));
        }
        if (combinedStaff.length > 0) {
           activities.push(...combinedStaff.map((app: any) => ({
             id: `staff_${app.id}`,
             type: 'staff',
             title: 'New Staff Registered',
             description: `${app.first_name} ${app.surname} registered as ${app.job_category}`,
             created_at: new Date(app.created_at || Date.now())
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

    fetchStats(true);

    const handleGlobalRefresh = () => {
      fetchStats(false);
    };
    window.addEventListener('dashboardStatsNeedRefresh', handleGlobalRefresh);

    if (isSupabaseConfigured && supabase) {
      const channel = supabase
         .channel('dashboard_changes')
         .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
           fetchStats();
         })
         .on('postgres_changes', { event: '*', schema: 'public', table: 'job_applications' }, () => {
           fetchStats();
         })
         .on('postgres_changes', { event: '*', schema: 'public', table: 'registered_students' }, () => {
           fetchStats();
         })
         .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
           fetchStats();
         })
         .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => {
           fetchStats();
         })
         .subscribe();

      return () => {
        supabase.removeChannel(channel);
        window.removeEventListener('dashboardStatsNeedRefresh', handleGlobalRefresh);
      };
    }

    return () => {
      window.removeEventListener('dashboardStatsNeedRefresh', handleGlobalRefresh);
    };
  }, []);

  const statCards = [
    { title: 'Total Student Applications', value: stats.applications, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Pending Admissions', value: stats.pendingApplications, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Approved Admissions', value: stats.approvedApplications, icon: FileText, color: 'text-brand-green', bg: 'bg-brand-green/10' },
    { title: 'Rejected Admissions', value: stats.rejectedApplications, icon: Trash2, color: 'text-red-500', bg: 'bg-red-500/10' },
    { title: 'Total Registered Students', value: stats.students, icon: Users, color: 'text-brand-pink', bg: 'bg-brand-pink/10' },
    { title: 'Total Staff', value: stats.staff, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Pending Job Applications', value: stats.pendingJobApplications, icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Approved Job Applications', value: stats.approvedJobApplications, icon: Users, color: 'text-brand-green', bg: 'bg-brand-green/10' },
    { title: 'Total Enquiries', value: stats.contacts, icon: Mailbox, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
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
              </DialogDescription>
              <div className="text-sm text-muted-foreground">
                <ul className="list-disc pl-6 mt-2 mb-2 font-medium">
                  <li>Applications</li>
                  <li>Job Applications</li>
                  <li>Registered Students</li>
                  <li>Blog / News Posts</li>
                  <li>Contacts / Messages</li>
                </ul>
                This action is irreversible and should only be used to clear out test data before live production.
                <div className="mt-4">
                  <Input 
                    type="password" 
                    placeholder="Enter approval pin to authorize..." 
                    value={resetPin}
                    onChange={(e) => setResetPin(e.target.value)}
                  />
                </div>
              </div>
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
                              <div className="h-10 w-10 min-w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><FileText className="h-5 w-5" /></div>
                           ) : activity.type === 'job_application' ? (
                              <div className="h-10 w-10 min-w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500"><Users className="h-5 w-5" /></div>
                           ) : activity.type === 'student' ? (
                              <div className="h-10 w-10 min-w-10 rounded-full bg-brand-pink/10 flex items-center justify-center text-brand-pink"><Users className="h-5 w-5" /></div>
                           ) : activity.type === 'staff' ? (
                              <div className="h-10 w-10 min-w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500"><Users className="h-5 w-5" /></div>
                           ) : (
                              <div className="h-10 w-10 min-w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500"><Mailbox className="h-5 w-5" /></div>
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
