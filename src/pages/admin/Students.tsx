import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { queryWithTimeout } from '@/lib/utils/supabase-timeout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Eye, User, Trash2, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

export default function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const navigate = useNavigate();

  const fetchStudents = async (showFullLoader = true) => {
    if (showFullLoader) setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        const localData = localStorage.getItem('hopexavier_mock_students');
        if (localData) {
          setStudents(JSON.parse(localData));
        } else {
          const seed = [
            {
              id: 'mock-student-1',
              created_at: new Date().toISOString(),
              surname: 'Okonkwo',
              other_names: 'Marvelous',
              registration_number: 'HFA/2026/012',
              class_applied: 'JS1',
              gender: 'male',
              dob: '2012-06-15',
              parent_name: 'Chioma Okonkwo',
              parent_phone: '08123456789',
              parent_email: 'chioma@gmail.com',
              residential_address: '15 Guita Area Council, Abuja',
              blood_group: 'O+',
              genotype: 'AA',
              allergies: 'None',
              medical_conditions: 'None'
            }
          ];
          localStorage.setItem('hopexavier_mock_students', JSON.stringify(seed));
          setStudents(seed);
        }
        return;
      }

      const { data, error } = await queryWithTimeout(supabase
        .from('registered_students')
        .select('*')
        .order('registration_number', { ascending: false }));

      if (error) {
        console.error("Supabase error:", error);
        toast.error("Failed to load students.");
      } else {
        setStudents(data || []);
      }
    } catch (e: any) {
      console.error("Error fetching students:", e);
    } finally {
      if (showFullLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(true);

    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('students_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'registered_students' }, () => {
          fetchStudents(false);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const handleDelete = async () => {
    if (!studentToDelete) return;
    setDeletingId(studentToDelete.id);
    
    // Instant UI Update - slice from state immediately
    setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));

    try {
      if (!isSupabaseConfigured) {
        const localData = localStorage.getItem('hopexavier_mock_students');
        if (localData) {
          const parsed = JSON.parse(localData);
          const filtered = parsed.filter((s: any) => s.id !== studentToDelete.id);
          localStorage.setItem('hopexavier_mock_students', JSON.stringify(filtered));
        }
        toast.success("Student deleted successfully.");
        setStudentToDelete(null);
        return;
      }

      const { error } = await supabase
        .from('registered_students')
        .delete()
        .eq('id', studentToDelete.id);
        
      if (error) throw error;
      
      toast.success("Student deleted successfully.");
      setStudentToDelete(null);
      fetchStudents(false);
      window.dispatchEvent(new Event('dashboardStatsNeedRefresh'));
    } catch (e: any) {
      console.error("Error deleting student:", e);
      toast.error(`Error deleting student: ${e.message}`);
      fetchStudents(false); // Restore state if actually failed
    } finally {
      setDeletingId(null);
    }
  };

  const filteredStudents = students.filter(s => {
      const matchesSearch = 
        s.surname?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.other_names?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.registration_number?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesClass = filterClass === 'All' ? true : s.class_applied === filterClass;
      return matchesSearch && matchesClass;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Students Directory</h1>
          <p className="text-muted-foreground">View and manage enrolled students.</p>
        </div>
        <Button onClick={() => navigate('/admin/dashboard/students/new')} className="bg-brand-pink hover:bg-brand-pink/90 text-white cursor-pointer font-semibold transition-colors shrink-0">
          Register New Students
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-4 space-y-4">
         <div className="flex flex-col sm:flex-row justify-between gap-4 border-b pb-4">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                   placeholder="Search Reg No or Name..." 
                   className="pl-8" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <div className="flex items-center gap-2">
                <select className="text-sm border rounded p-2 bg-white" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
                   <option value="All">All Classes</option>
                   <option value="JSS 1">JSS 1</option>
                   <option value="JSS 2">JSS 2</option>
                   <option value="JSS 3">JSS 3</option>
                   <option value="SSS 1">SSS 1</option>
                   <option value="SSS 2">SSS 2</option>
                   <option value="SSS 3">SSS 3</option>
                </select>
             </div>
         </div>

        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registration Number</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Loading students...</TableCell></TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No students match your filter or search.</TableCell></TableRow>
            ) : (
              filteredStudents.map((stu) => (
                <TableRow key={stu.id || stu.registration_number}>
                  <TableCell className="font-semibold">{stu.registration_number}</TableCell>
                  <TableCell className="font-medium">{stu.surname} {stu.other_names}</TableCell>
                  <TableCell>{stu.class_applied}</TableCell>
                  <TableCell className="capitalize">{stu.gender}</TableCell>
                  <TableCell>{stu.email_address || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-brand-green/10 hover:text-brand-green"
                              onClick={() => setSelectedStudent(stu)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                          <DialogHeader>
                            <DialogTitle>Student Details</DialogTitle>
                          </DialogHeader>
                          {selectedStudent && (
                            <div className="mt-6 space-y-6">
                              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 border-b border-border pb-6">
                                <div className="h-32 w-32 rounded-xl overflow-hidden bg-muted flex items-center justify-center border-2 border-border shadow-sm flex-shrink-0">
                                  {selectedStudent.passport_photo_url ? (
                                    <img 
                                      src={selectedStudent.passport_photo_url} 
                                      alt={`${selectedStudent.surname} passport`} 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="h-12 w-12 text-muted-foreground/50" />
                                  )}
                                </div>
                                <div className="space-y-1 text-center sm:text-left">
                                  <h3 className="text-2xl font-bold">{selectedStudent.surname} {selectedStudent.other_names}</h3>
                                  <div className="text-brand-green font-medium font-mono text-lg">{selectedStudent.registration_number}</div>
                                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-green/10 text-brand-green mt-2">
                                    {selectedStudent.status || 'Active'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                <div>
                                  <div className="text-muted-foreground mb-1">Class Enrolled</div>
                                  <div className="font-medium">{selectedStudent.class_applied}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground mb-1">Gender</div>
                                  <div className="font-medium capitalize">{selectedStudent.gender}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground mb-1">Date of Birth</div>
                                  <div className="font-medium">{selectedStudent.date_of_birth || 'N/A'}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground mb-1">Student Email</div>
                                  <div className="font-medium">{selectedStudent.email_address || 'N/A'}</div>
                                </div>
                                <div className="col-span-2">
                                  <div className="text-muted-foreground mb-1">Home Address</div>
                                  <div className="font-medium">{selectedStudent.house_address || 'N/A'}</div>
                                </div>
                              </div>
                              
                              <div className="bg-muted p-4 rounded-lg space-y-4">
                                <h4 className="font-semibold border-b border-border/50 pb-2">Parent/Guardian Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <div className="text-muted-foreground mb-1">Name</div>
                                    <div className="font-medium">{selectedStudent.parents_name || 'N/A'}</div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground mb-1">Phone Number</div>
                                    <div className="font-medium">{selectedStudent.parents_phone || 'N/A'}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Dialog open={studentToDelete?.id === stu.id} onOpenChange={(open) => { if (!open) setStudentToDelete(null); }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setStudentToDelete(stu)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete the student <strong>{stu.surname} {stu.other_names}</strong>? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setStudentToDelete(null)} disabled={deletingId === stu.id}>
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={deletingId === stu.id}>
                              {deletingId === stu.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}
