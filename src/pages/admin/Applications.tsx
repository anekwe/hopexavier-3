import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { queryWithTimeout } from '@/lib/utils/supabase-timeout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Applications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const { session } = useAuth();

  const fetchApplications = async (showFullLoader = true) => {
    console.log("fetchApplications started, showFullLoader:", showFullLoader);
    if (showFullLoader) setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        console.log("fetchApplications: Supabase not configured");
        const localData = localStorage.getItem('hopexavier_mock_applications');
        if (localData) {
          setApplications(JSON.parse(localData));
        } else {
          const seed = [
            {
              id: 'mock-1',
              created_at: new Date().toISOString(),
              student_fname: 'Marvelous',
              student_surname: 'Okonkwo',
              dob: '2012-06-15',
              gender: 'male',
              class_applied: 'JS1',
              parent_name: 'Chioma Okonkwo',
              parent_phone: '08123456789',
              parent_email: 'chioma@gmail.com',
              address: '15 Guita Area Council, Abuja',
              prev_school: 'LEA Primary School',
              status: 'Pending'
            }
          ];
          localStorage.setItem('hopexavier_mock_applications', JSON.stringify(seed));
          setApplications(seed);
        }
        return;
      }

      console.log("fetchApplications: Supabase is configured, issuing query...");
      const { data, error } = await queryWithTimeout(supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false }));

      console.log("fetchApplications: query resolved, error:", error, "data:", data ? data.length : 0);

      if (error) {
        console.error("Supabase error:", error);
        toast.error("Failed to fetch applications: " + error.message);
      } else {
        setApplications(data || []);
      }
    } catch (e: any) {
      console.error("Error fetching applications:", e);
      toast.error("Failed to fetch applications");
    } finally {
      console.log("fetchApplications finally block, setting loading false");
      if (showFullLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(true);

    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('applications_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
          fetchApplications(false); // Backgound refresh only
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const handleReset = async () => {
    setResetting(true);
    setApplications([]);
    try {
      if (!isSupabaseConfigured) {
        localStorage.removeItem('hopexavier_mock_applications');
        toast.success('All testing applications wiped successfully!');
        setOpenDialog(false);
        return;
      }

      let hasMore = true;
      let loopCount = 0;
      while (hasMore && loopCount < 50) {
         loopCount++;
         const { data, error } = await supabase.from('applications').select('id').limit(1000);
         if (error) throw new Error(error.message);
         if (!data || data.length === 0) {
            hasMore = false;
            break;
         }
         const ids = data.map(r => r.id);
         const { error: delError } = await supabase.from('applications').delete().in('id', ids);
         
         if (delError) {
             console.warn("Initial bulk delete failed, attempting fallback...", delError);
             const { error: fallbackError } = await supabase.from('applications').delete().not('created_at', 'is', null);
             if (fallbackError) throw new Error(fallbackError.message);
             hasMore = false;
         } else {
             // Verify if actually deleted to avoid infinite loop due to RLS block
             const { count, error: countError } = await supabase.from('applications').select('id', { count: 'exact', head: true }).in('id', ids);
             if (count && count > 0) {
                 console.warn("Rows were not deleted despite no error. Attempting fallback...");
                 const { error: fallbackError } = await supabase.from('applications').delete().not('created_at', 'is', null);
                 if (fallbackError) throw new Error(fallbackError.message);
                 hasMore = false;
             }
         }
      }

      toast.success('All testing applications wiped successfully!');
      setOpenDialog(false);
      window.dispatchEvent(new Event('dashboardStatsNeedRefresh'));
    } catch (e: any) {
      toast.error('Failed to reset data: ' + e.message);
      fetchApplications(false);
    } finally {
      setResetting(false);
    }
  };

  const updateStatus = async (id: string, status: string, appData?: any) => {
    // Instant UI update
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));

    try {
      if (!isSupabaseConfigured) {
        const localData = localStorage.getItem('hopexavier_mock_applications');
        if (localData) {
          const parsed = JSON.parse(localData);
          const updated = parsed.map((app: any) => app.id === id ? { ...app, status } : app);
          localStorage.setItem('hopexavier_mock_applications', JSON.stringify(updated));
        }
        toast.success(`Application updated to ${status}`);
        return;
      }

      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id);
      if (error) throw error;

      if (status === 'Accepted' && appData) {
         toast.success(`Application updated to ${status}. Applicant can now be registered.`);
      } else {
         toast.success(`Application updated to ${status}`);
      }
      
      fetchApplications(false);
      window.dispatchEvent(new Event('dashboardStatsNeedRefresh'));
    } catch (e: any) {
       console.error("Error updating application", e);
       toast.error("Failed to update status");
       fetchApplications(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Applications</h1>
          <p className="text-muted-foreground">Manage and review student admission applications. View all details and accept/reject applicants.</p>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="group cursor-pointer shrink-0">
              <Trash2 className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
              Clear All Testing Data
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-500 flex items-center gap-2">
                <Trash2 className="h-5 w-5" /> Wipe Applications Data
              </DialogTitle>
              <DialogDescription>
                Are you sure? This will permanently delete all student application testing data.
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

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-border p-10 text-center text-muted-foreground flex flex-col items-center justify-center">
            <p className="text-lg font-semibold">No applications found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl shadow-sm border border-border p-6 space-y-4">
                 <div className="flex justify-between items-start border-b pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-brand-green">{app.student_fname} {app.student_surname}</h2>
                      <p className="text-sm text-muted-foreground">Applied for: <span className="font-semibold text-foreground">{app.class_applied}</span></p>
                    </div>
                    <Badge variant={app.status === 'Accepted' ? 'default' : app.status === 'Rejected' ? 'destructive' : 'outline'}
                      className={app.status === 'Accepted' ? 'bg-brand-green' : app.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''}
                    >
                      {app.status ? app.status.toUpperCase() : 'PENDING'}
                    </Badge>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Date of Birth</p>
                      <p>{app.dob || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Gender</p>
                      <p className="capitalize">{app.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Previous School</p>
                      <p>{app.prev_school || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Applicaton Date</p>
                      <p>{new Date(app.created_at).toLocaleDateString()}</p>
                    </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-bold text-brand-green uppercase">Parent / Guardian Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                       <div className="col-span-2">
                         <p className="text-xs text-muted-foreground uppercase font-semibold">Full Name</p>
                         <p>{app.parent_name || app.parent_full_name || 'N/A'}</p>
                       </div>
                       <div>
                         <p className="text-xs text-muted-foreground uppercase font-semibold">Phone Number</p>
                         <p>{app.parent_phone || app.phone || 'N/A'}</p>
                       </div>
                       <div>
                         <p className="text-xs text-muted-foreground uppercase font-semibold">Email Address</p>
                         <p>{app.parent_email || app.email || 'N/A'}</p>
                       </div>
                       <div className="col-span-2">
                         <p className="text-xs text-muted-foreground uppercase font-semibold">Residential Address</p>
                         <p>{app.address || 'N/A'}</p>
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-3 pt-6 border-t">
                    <Button 
                       className="flex-1 bg-brand-pink hover:bg-brand-pink/90 text-white" 
                       onClick={() => updateStatus(app.id, 'Accepted', app)}
                       disabled={app.status === 'Accepted'}
                    >
                       Accept & Admit
                    </Button>
                    <Button 
                       className="flex-1" 
                       variant="destructive"
                       onClick={() => updateStatus(app.id, 'Rejected')}
                       disabled={app.status === 'Rejected'}
                    >
                       Reject
                    </Button>
                    <Button
                       className="flex-none text-red-500 bg-red-50 hover:bg-red-100 border border-red-200"
                       variant="outline"
                       title="Delete Application"
                       onClick={async () => {
                         if (window.confirm('Are you sure you want to permanently delete this application?')) {
                            try {
                              const { error } = await (async () => {
                                  // Optimistically filter the application in state so it disappears instantly from the screen
                                  setApplications(prev => prev.filter(item => item.id !== app.id));
                                  
                                  if (!isSupabaseConfigured) {
                                    const localData = localStorage.getItem('hopexavier_mock_applications');
                                    if (localData) {
                                      const parsed = JSON.parse(localData);
                                      const filtered = parsed.filter((a: any) => a.id !== app.id);
                                      localStorage.setItem('hopexavier_mock_applications', JSON.stringify(filtered));
                                    }
                                    toast.success('Application deleted successfully.');
                                    return { error: null };
                                  }
                                  return supabase.from('applications').delete().eq('id', app.id);
                               })();
                              if (error) throw error;
                              // Force a hard refresh of state just in case realtime drops it
                              toast.success('Application deleted successfully!');
                              // actually this runs inside the render, so we shouldn't reference state unless it's in a func, fetchApplications is better
                              fetchApplications(false);
                              window.dispatchEvent(new Event('dashboardStatsNeedRefresh'));
                            } catch (e) {
                              toast.error('Failed to delete application: ' + e.message);
                            }
                         }
                       }}
                    >
                       <Trash2 className="h-4 w-4" />
                    </Button>
                 </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
