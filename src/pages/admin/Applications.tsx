import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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

  const fetchApplications = async () => {
    setLoading(true);
    try {
      if (!supabase) throw new Error("Supabase is not configured.");
      
      const dbPromise = supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      const timeoutPromise = new Promise<{ data: any, error: any }>((resolve) => 
        setTimeout(() => resolve({ data: null, error: new Error("TIMEOUT") }), 8000)
      );

      const { data, error } = await Promise.race([dbPromise, timeoutPromise]) as { data: any, error: any };
      
      let loadedData = [];
      if (error) {
        if (error.message === 'TIMEOUT') {
           console.warn("Supabase request timed out. Loading local data.");
        } else if (error.code === '42P01' || (error.message && error.message.includes("relation") && error.message.includes("does not exist"))) {
           console.warn("Table does not exist. Please run the SQL schema.");
        } else {
           console.error("Supabase error:", error);
        }
      } else if (data) {
        loadedData = data;
      }
      
      if (!session) {
         try {
           const localApps = JSON.parse(localStorage.getItem('local_applications') || '[]');
           loadedData = [...localApps, ...loadedData];
         } catch(e) {}
      }
      
      setApplications(loadedData);
    } catch (e: any) {
      console.error("Error fetching applications:", e);
      let localApps = [];
      try {
         localApps = JSON.parse(localStorage.getItem('local_applications') || '[]');
      } catch(er) {}
      setApplications(localApps);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleReset = async () => {
    setResetting(true);
    try {
      localStorage.removeItem('local_applications');
      localStorage.removeItem('appData_local');

      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      await supabase.from('applications').delete().neq('id', fakeUuid);

      toast.success('All testing applications wiped successfully!');
      setOpenDialog(false);
      setApplications([]);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (e: any) {
      toast.error('Failed to reset data: ' + e.message);
    } finally {
      setResetting(false);
    }
  };

  const updateStatus = async (id: string, status: string, appData?: any) => {
    try {
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
      
      fetchApplications();
    } catch (e: any) {
       console.error("Error updating application", e);
       toast.error("Failed to update status");
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
                 </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
