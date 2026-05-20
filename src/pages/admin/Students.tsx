import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Eye, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const navigate = useNavigate();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      if (!supabase) throw new Error("Supabase is not configured.");
      
      const { data, error } = await supabase
        .from('registered_students')
        .select('*')
        .order('registration_number', { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
      } else {
        setStudents(data || []);
      }
    } catch (e: any) {
      console.error("Error fetching students:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();

    if (supabase) {
      const channel = supabase
        .channel('students_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'registered_students' }, () => {
          fetchStudents();
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Students Directory</h1>
          <p className="text-muted-foreground">View and manage enrolled students.</p>
        </div>
        <Button onClick={() => navigate('/admin/dashboard/students/new')} className="bg-brand-pink hover:bg-brand-pink/90 text-white cursor-pointer font-semibold transition-colors">
          Register New Students
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
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
            ) : students.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No students enrolled yet. Please register new students to see them here.</TableCell></TableRow>
            ) : (
              students.map((stu) => (
                <TableRow key={stu.id || stu.registration_number}>
                  <TableCell className="font-semibold">{stu.registration_number}</TableCell>
                  <TableCell className="font-medium">{stu.surname} {stu.other_names}</TableCell>
                  <TableCell>{stu.class_applied}</TableCell>
                  <TableCell className="capitalize">{stu.gender}</TableCell>
                  <TableCell>{stu.email_address || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger 
                        render={
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="hover:bg-brand-green/10 hover:text-brand-green"
                            onClick={() => setSelectedStudent(stu)}
                          />
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
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
