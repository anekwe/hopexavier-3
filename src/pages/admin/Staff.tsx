import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { queryWithTimeout } from '@/lib/utils/supabase-timeout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStaff() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStaff = async (showFullLoader = true) => {
    if (showFullLoader) setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        const localData = localStorage.getItem('hopexavier_mock_staff');
        if (localData) {
          setStaffList(JSON.parse(localData));
        } else {
          const seed = [
            {
              id: 'mock-staff-1',
              staff_number: 'HFA/STAFF/001',
              surname: 'Prince',
              first_name: 'Xavier',
              other_names: 'Hope',
              job_category: 'Academic Staff (Teacher)',
              gender: 'male',
              email_address: 'hopexavier@gmail.com',
              phone_number: '08011223344'
            }
          ];
          localStorage.setItem('hopexavier_mock_staff', JSON.stringify(seed));
          setStaffList(seed);
        }
        return;
      }

      const { data, error } = await queryWithTimeout(supabase
        .from('staff_documentation')
        .select('*')
        .order('staff_number', { ascending: false }));

      if (error) {
         console.error("Supabase error:", error);
         toast.error("Failed to fetch staff.");
      } else {
         setStaffList(data || []);
      }
    } catch (e: any) {
      console.error("Error fetching staff:", e);
    } finally {
      if (showFullLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff(true);

    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('staff_documentation_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_documentation' }, () => {
          fetchStaff(false);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Staff Directory</h1>
          <p className="text-muted-foreground">View and manage staff documentation.</p>
        </div>
        <Button onClick={() => navigate('/admin/dashboard/staff/new')} className="bg-brand-pink hover:bg-brand-pink/90 text-white cursor-pointer font-semibold transition-colors">
          Document New Staff
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Number</TableHead>
              <TableHead>Staff Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Loading staff...</TableCell></TableRow>
            ) : staffList.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No documented staff yet.</TableCell></TableRow>
            ) : (
              staffList.map((st) => (
                <TableRow key={st.id}>
                  <TableCell className="font-mono font-medium">{st.staff_number}</TableCell>
                  <TableCell className="font-semibold">{st.surname} {st.first_name} {st.other_names}</TableCell>
                  <TableCell>{st.job_category}</TableCell>
                  <TableCell>{st.gender}</TableCell>
                  <TableCell>{st.email_address}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">View</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Staff Details</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 text-sm">
                           <div className="flex gap-4 mb-4">
                             {st.passport_photo_url ? (
                               <img src={st.passport_photo_url} alt="Passport" className="w-24 h-24 rounded-lg object-cover bg-gray-100" />
                             ) : (
                               <div className="w-24 h-24 rounded-lg bg-gray-200 flex flex-col justify-center items-center text-xs text-gray-500">No Photo</div>
                             )}
                             <div>
                               <p className="font-bold text-lg">{st.surname} {st.first_name}</p>
                               <p className="font-mono text-xs text-gray-600 mb-1">{st.staff_number}</p>
                               <p className="text-brand-green font-medium">{st.job_category}</p>
                             </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                             <div>
                               <span className="text-muted-foreground text-xs block">Other Names</span>
                               <span>{st.other_names || 'N/A'}</span>
                             </div>
                             <div>
                               <span className="text-muted-foreground text-xs block">Date of Birth</span>
                               <span>{st.date_of_birth}</span>
                             </div>
                             <div>
                               <span className="text-muted-foreground text-xs block">Gender</span>
                               <span>{st.gender}</span>
                             </div>
                             <div>
                               <span className="text-muted-foreground text-xs block">Phone</span>
                               <span>{st.phone_number}</span>
                             </div>
                             <div className="col-span-2">
                               <span className="text-muted-foreground text-xs block">Email</span>
                               <span>{st.email_address}</span>
                             </div>
                             <div className="col-span-2">
                               <span className="text-muted-foreground text-xs block">Address</span>
                               <span>{st.residential_address}</span>
                             </div>
                             <div className="col-span-2">
                               <span className="text-muted-foreground text-xs block">Educational Records</span>
                               <span className="whitespace-pre-wrap bg-gray-50 p-2 rounded border mt-1 block">{st.educational_records}</span>
                             </div>
                             
                             {(st.primary_school_cert_url || st.secondary_school_cert_url || st.university_degree_url || st.other_certificates_url) && (
                              <div className="col-span-2 mt-2 pt-2 border-t">
                                <span className="text-muted-foreground text-xs block font-semibold mb-2">Uploaded Certificates</span>
                                <div className="space-y-1 text-sm">
                                  {st.primary_school_cert_url && (
                                    <a href={st.primary_school_cert_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block pb-1 border-b border-gray-100 flex items-center justify-between">
                                      Primary School Certificate
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                    </a>
                                  )}
                                  {st.secondary_school_cert_url && (
                                    <a href={st.secondary_school_cert_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block pb-1 border-b border-gray-100 flex items-center justify-between">
                                      Secondary School Certificate
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                    </a>
                                  )}
                                  {st.university_degree_url && (
                                    <a href={st.university_degree_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block pb-1 border-b border-gray-100 flex items-center justify-between">
                                      University Degree
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                    </a>
                                  )}
                                  {st.other_certificates_url && (
                                    (() => {
                                      try {
                                        const parsed = JSON.parse(st.other_certificates_url);
                                        if (Array.isArray(parsed)) {
                                          return parsed.map((cert: any, idx: number) => (
                                             <a key={idx} href={cert.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block pb-1 border-b border-gray-100 flex items-center justify-between">
                                               {cert.name || `Document ${idx + 1}`}
                                               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                             </a>
                                          ));
                                        }
                                        throw new Error("Not array");
                                      } catch (e) {
                                        return (
                                          <a href={st.other_certificates_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block flex items-center justify-between">
                                            Other Certificates
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                          </a>
                                        );
                                      }
                                    })()
                                  )}
                                </div>
                              </div>
                             )}
                           </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                       variant="outline" 
                       size="sm" 
                       onClick={async () => {
                         if(window.confirm('Are you sure you want to permanently delete this staff record?')) {
                           try {
                             const { error } = await (async () => {
                                  // Instant local filter to update view immediately
                                  setStaffList(prev => prev.filter(item => item.id !== st.id));

                                  if (!isSupabaseConfigured) {
                                    const localData = localStorage.getItem('hopexavier_mock_staff');
                                    if (localData) {
                                      const parsed = JSON.parse(localData);
                                      const filtered = parsed.filter((s: any) => s.id !== st.id);
                                      localStorage.setItem('hopexavier_mock_staff', JSON.stringify(filtered));
                                    }
                                    toast.success('Staff record deleted successfully.');
                                    return { error: null };
                                  }
                                  return supabase.from('staff_documentation').delete().eq('id', st.id);
                               })();
                             if (error) throw error;
                             window.dispatchEvent(new Event('dashboardStatsNeedRefresh'));
                             fetchStaff(false);
                           } catch (e) {
                             console.error(e);
                           }
                         }
                       }}
                    >
                       <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
