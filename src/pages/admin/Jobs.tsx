import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { queryWithTimeout } from '@/lib/utils/supabase-timeout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Search, Briefcase, ExternalLink, Calendar, Filter, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function AdminJobs() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const fetchApplications = async (showFullLoader = true) => {
    if (showFullLoader) setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        const localData = localStorage.getItem('hopexavier_mock_jobs');
        if (localData) {
          setApplications(JSON.parse(localData));
        } else {
          const seed = [
            {
              id: 'mock-job-1',
              created_at: new Date().toISOString(),
              surname: 'Solomon',
              other_names: 'Chukwuemeka',
              email_address: 'solomon@gmail.com',
              phone_number: '09012345678',
              job_category: 'Academic Staff (Teacher)',
              educational_qualifications: 'B.Ed in Mathematics, University of Ibadan',
              application_status: 'Pending',
              documentation_status: 'Pending'
            }
          ];
          localStorage.setItem('hopexavier_mock_jobs', JSON.stringify(seed));
          setApplications(seed);
        }
        return;
      }

      const { data, error } = await queryWithTimeout(supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false }));

      if (error) {
         console.error("Supabase error:", error);
         toast.error("Failed to fetch applications: " + error.message);
      } else {
         setApplications(data || []);
      }
    } catch (e: any) {
      console.error("Error fetching job applications:", e);
      toast.error("Error fetching job applications");
    } finally {
      if (showFullLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(true);

    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('job_applications_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'job_applications' }, () => {
          fetchApplications(false);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
     // Instant local update
     setApplications(prev => prev.map(app => app.id === id ? { ...app, application_status: newStatus } : app));

     try {
         if (!isSupabaseConfigured) {
            const localData = localStorage.getItem('hopexavier_mock_jobs');
            if (localData) {
               const parsed = JSON.parse(localData);
               const updated = parsed.map((app: any) => app.id === id ? { ...app, application_status: newStatus } : app);
               localStorage.setItem('hopexavier_mock_jobs', JSON.stringify(updated));
            }
            toast.success(`Status updated to ${newStatus}`);
            return;
         }

         const { error } = await supabase.from('job_applications').update({ application_status: newStatus }).eq('id', id);
         if (error) {
             throw error;
         }
         
         toast.success(`Status updated to ${newStatus}`);
         fetchApplications(false);
         window.dispatchEvent(new Event('dashboardStatsNeedRefresh'));
     } catch (e: any) {
         toast.error(e.message || "Failed to update status");
         fetchApplications(false);
     }
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      app.surname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.other_names?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email_address?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCat = filterCategory === 'All' ? true : app.job_category === filterCategory;
    const matchesStatus = filterStatus === 'All' ? true : app.application_status === filterStatus;
    
    return matchesSearch && matchesCat && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
       case 'Pending': return 'bg-yellow-100 text-yellow-800';
       case 'Interview Scheduled': return 'bg-blue-100 text-blue-800';
       case 'Under Review': return 'bg-purple-100 text-purple-800';
       case 'Employed': return 'bg-green-100 text-green-800';
       case 'Rejected': return 'bg-red-100 text-red-800';
       default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark-green flex items-center gap-2">
            <Briefcase className="h-6 w-6" /> Job Applications
          </h1>
          <p className="text-muted-foreground text-sm">Manage job applications and recruitment status.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
           <div className="flex flex-col md:flex-row justify-between gap-4">
               <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                     placeholder="Search applicants..." 
                     className="pl-8" 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <div className="flex gap-2">
                   <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <select className="text-sm border rounded p-2" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                         <option value="All">All Categories</option>
                         <option value="Teaching Jobs">Teaching Jobs</option>
                         <option value="Non-Teaching Jobs">Non-Teaching Jobs</option>
                      </select>
                   </div>
                   <div className="flex items-center gap-2">
                      <select className="text-sm border rounded p-2" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                         <option value="All">All Statuses</option>
                         <option value="Pending">Pending</option>
                         <option value="Interview Scheduled">Interview Scheduled</option>
                         <option value="Under Review">Under Review</option>
                         <option value="Employed">Employed</option>
                         <option value="Rejected">Rejected</option>
                      </select>
                   </div>
               </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Qualifications</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Docs</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-green" />
                      <p className="text-sm text-muted-foreground mt-2">Loading applications...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredApps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="font-semibold text-brand-dark-green">{app.surname} {app.other_names}</div>
                        <div className="text-xs text-muted-foreground">{app.email_address}</div>
                        <div className="text-xs text-muted-foreground">{app.phone_number}</div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{app.job_category}</span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={app.educational_qualifications}>
                        <span className="text-sm">{app.educational_qualifications}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.application_status)}`}>
                          {app.application_status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{app.documentation_status || 'Pending'}</span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to permanently delete this job application?')) {
                              try {
                                const { error } = await (async () => {
                                  setApplications(prev => prev.filter(item => item.id !== app.id));
                                  if (!isSupabaseConfigured) {
                                    const localData = localStorage.getItem('hopexavier_mock_jobs');
                                    if (localData) {
                                      const parsed = JSON.parse(localData);
                                      const filtered = parsed.filter((a: any) => a.id !== app.id);
                                      localStorage.setItem('hopexavier_mock_jobs', JSON.stringify(filtered));
                                    }
                                    toast.success('Job application deleted successfully.');
                                    return { error: null };
                                  }
                                  return supabase.from('job_applications').delete().eq('id', app.id);
                                })();
                                if (error) throw error;
                                toast.success('Job application deleted successfully!');
                                fetchApplications(false);
                                window.dispatchEvent(new Event('dashboardStatsNeedRefresh'));
                              } catch (e: any) {
                                toast.error('Failed to delete job application: ' + e.message);
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">View</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Applicant Details</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                               <div className="grid grid-cols-2 gap-4">
                                 <div>
                                   <Label className="text-xs text-muted-foreground">Surname</Label>
                                   <p className="font-medium">{app.surname}</p>
                                 </div>
                                 <div>
                                   <Label className="text-xs text-muted-foreground">Other Names</Label>
                                   <p className="font-medium">{app.other_names}</p>
                                 </div>
                                 <div>
                                   <Label className="text-xs text-muted-foreground">Category</Label>
                                   <p className="font-medium">{app.job_category}</p>
                                 </div>
                                 <div>
                                   <Label className="text-xs text-muted-foreground">Gender</Label>
                                   <p className="font-medium">{app.gender}</p>
                                 </div>
                                 <div>
                                   <Label className="text-xs text-muted-foreground">Email</Label>
                                   <p className="font-medium">{app.email_address}</p>
                                 </div>
                                 <div>
                                   <Label className="text-xs text-muted-foreground">Phone Number</Label>
                                   <p className="font-medium">{app.phone_number}</p>
                                 </div>
                                 <div className="col-span-2">
                                   <Label className="text-xs text-muted-foreground">Qualifications</Label>
                                   <p className="font-medium bg-gray-50 p-2 rounded border mt-1">{app.educational_qualifications}</p>
                                 </div>
                                 <div className="col-span-2 border-t pt-4">
                                   <Label className="text-xs text-muted-foreground mb-2 block">Update Status Workflow</Label>
                                   <div className="flex flex-wrap gap-2">
                                     <Button size="sm" variant={app.application_status === 'Pending' ? "default" : "outline"} onClick={() => updateStatus(app.id, 'Pending')}>Pending</Button>
                                     <Button size="sm" variant={app.application_status === 'Interview Scheduled' ? "default" : "outline"} onClick={() => updateStatus(app.id, 'Interview Scheduled')}>Interview</Button>
                                     <Button size="sm" variant={app.application_status === 'Under Review' ? "default" : "outline"} onClick={() => updateStatus(app.id, 'Under Review')}>Review</Button>
                                     <Button size="sm" variant={app.application_status === 'Employed' ? "default" : "outline"} onClick={() => updateStatus(app.id, 'Employed')} className="border-green-500 text-green-700 hover:bg-green-50">Employ</Button>
                                     <Button size="sm" variant={app.application_status === 'Rejected' ? "default" : "outline"} onClick={() => updateStatus(app.id, 'Rejected')} className="border-red-500 text-red-700 hover:bg-red-50">Reject</Button>
                                   </div>
                                 </div>
                               </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
