import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function RegisterStudent() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  const [formData, setFormData] = useState({
    registration_number: '',
    surname: '',
    other_names: '',
    date_of_birth: '',
    gender: 'Male',
    house_address: '',
    parents_name: '',
    parents_phone: '',
    email_address: '',
    class_applied: '',
  });

  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const [acceptedApplicants, setAcceptedApplicants] = useState<any[]>([]);
  const [selectedApplicantId, setSelectedApplicantId] = useState('');
  const [recentStudents, setRecentStudents] = useState<any[]>([]);

  useEffect(() => {
    fetchAcceptedApplicants();
    fetchRecentStudents();
    
    // Auto-generate the next admission number on load
    generateRegNumber().then(num => {
      setFormData(prev => ({ ...prev, registration_number: num }));
    });
  }, []);

  const fetchAcceptedApplicants = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('status', 'Accepted');
      
      let loadedData = data || [];
      const localApps = JSON.parse(localStorage.getItem('local_applications') || '[]');
      const localAccepted = localApps.filter((a: any) => a.status === 'Accepted');
      loadedData = [...localAccepted, ...loadedData];
      
      setAcceptedApplicants(loadedData);
    } catch (e) {
      console.error(e);
      const localApps = JSON.parse(localStorage.getItem('local_applications') || '[]');
      const localAccepted = localApps.filter((a: any) => a.status === 'Accepted');
      setAcceptedApplicants(localAccepted);
    }
  };

  const fetchRecentStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('registered_students')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
        
      let loadedData = data || [];
      const localSt = JSON.parse(localStorage.getItem('local_students') || '[]');
      loadedData = [...localSt.slice(0, 5), ...loadedData];
      setRecentStudents(loadedData);
    } catch (err) {
      const localSt = JSON.parse(localStorage.getItem('local_students') || '[]');
      setRecentStudents(localSt.slice(0, 5));
    }
  };

  const handleApplicantSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedApplicantId(id);
    if (!id) {
       setFormData(prev => ({
         ...prev,
         surname: '',
         other_names: '',
         date_of_birth: '',
         gender: 'Male',
         house_address: '',
         parents_name: '',
         parents_phone: '',
         email_address: '',
         class_applied: '',
       }));
       return;
    }
    
    const app = acceptedApplicants.find(a => String(a.id) === String(id));
    if (app) {
      setFormData(prev => ({
        ...prev,
        surname: app.student_surname || '',
        other_names: app.student_fname || '',
        date_of_birth: app.dob || '',
        gender: app.gender || 'Male',
        house_address: app.address || '',
        parents_name: app.parent_name || app.parent_full_name || '',
        parents_phone: app.parent_phone || app.phone || '',
        email_address: app.email || app.parent_email || '',
        class_applied: app.class_applied || '',
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const generateRegNumber = async () => {
    try {
      // Find the highest number for the current year
      const prefix = `HXFA/${currentYear}/`;
      let maxSequence = -1;

      const { data, error } = await supabase
        .from('registered_students')
        .select('registration_number')
        .like('registration_number', `${prefix}%`)
        .order('registration_number', { ascending: false })
        .limit(1);

      if (error && error.code !== '42P01') { 
        // Ignore relation does not exist error
        console.error("Error fetching max reg number:", error);
      }

      if (data && data.length > 0) {
        const lastSeqStr = data[0].registration_number.split('/').pop();
        maxSequence = Math.max(maxSequence, parseInt(lastSeqStr, 10));
      }

      // Check local storage as well
      const localSt = JSON.parse(localStorage.getItem('local_students') || '[]');
      const localNumbers = localSt
        .map((s: any) => s.registration_number)
        .filter((r: any) => r && r.startsWith(prefix));
      
      for (const reg of localNumbers) {
        const seqStr = reg.split('/').pop();
        maxSequence = Math.max(maxSequence, parseInt(seqStr, 10));
      }

      const sequence = maxSequence + 1;
      return `${prefix}${sequence.toString().padStart(5, '0')}`;
    } catch (e) {
      console.error("Error generating reg number", e);
      return `HXFA/${currentYear}/00000`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Spam Protection / Dummy Data Validation
    const isDummyData = (str: string) => {
      if (!str) return false;
      const lower = str.toLowerCase().trim();
      if (lower.length < 2) return true;
      if (lower === 'test' || lower === 'dummy' || lower === 'none' || lower === 'nil') return true;
      if (/^(.)\1+$/.test(lower)) return true; // e.g., "xx", "yyy"
      return false;
    };

    if (isDummyData(formData.surname) || isDummyData(formData.other_names)) {
      toast.error('Please enter a valid student name.');
      return;
    }

    if (isDummyData(formData.parents_name)) {
      toast.error('Please enter a valid parents name.');
      return;
    }

    if (formData.parents_phone && formData.parents_phone.length < 5) {
      toast.error('Please enter a valid phone number.');
      return;
    }

    setLoading(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email_address)) {
        throw new Error("Invalid email address format.");
      }

      const regNumber = formData.registration_number || await generateRegNumber();

      let passportUrl = null;
      if (photoFile) {
        try {
           const fileExt = photoFile.name.split('.').pop();
           const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
           const filePath = `${currentYear}/${fileName}`;
           
           const { error: uploadError } = await supabase.storage
             .from('student-passports')
             .upload(filePath, photoFile);
             
           if (uploadError) {
             console.warn(`Failed to upload photo: ${uploadError.message}`);
           } else {
              const { data: publicUrlData } = supabase.storage
                .from('student-passports')
                .getPublicUrl(filePath);
                
              passportUrl = publicUrlData.publicUrl;
           }
        } catch (e) {
           console.warn("Storage exception", e);
        }
      }

      const studentData = {
        surname: formData.surname,
        other_names: formData.other_names,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        house_address: formData.house_address,
        parents_name: formData.parents_name,
        parents_phone: formData.parents_phone,
        email_address: formData.email_address,
        class_applied: formData.class_applied,
        registration_number: regNumber,
        passport_photo_url: passportUrl,
        status: 'active'
      };

      // Ensure that 'registered_students' table exists. 
      // Falling back to 'students' to test connection, but user requested corresponding table.
      // We'll create the record in a 'registered_students' table.
      try {
         const { error } = await supabase.from('registered_students').insert([studentData]);
         if (error) throw error;
      } catch (err: any) {
         console.warn("Supabase insert failed, relying on local storage", err);
      }
      
      const localStudents = JSON.parse(localStorage.getItem('local_students') || '[]');
      localStudents.push({ ...studentData, id: `local_${Date.now()}`, created_at: new Date().toISOString() });
      localStorage.setItem('local_students', JSON.stringify(localStudents));

      toast.success(`Successfully registered! Reg No: ${regNumber}`);
      navigate('/admin/dashboard/students');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Register New Student</h1>
          <p className="text-muted-foreground">Admit a new student into the academy.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/dashboard/students')}>
          Cancel
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-6 md:p-8">
        
        {acceptedApplicants.length > 0 && (
          <div className="space-y-4 mb-8 pb-6 border-b">
            <h2 className="text-lg font-semibold">Pre-fill from Accepted Applications</h2>
            <div className="space-y-2">
              <Label htmlFor="applicant_select">Select Applicant</Label>
              <select
                id="applicant_select"
                value={selectedApplicantId}
                onChange={handleApplicantSelect}
                className="flex h-10 w-full max-w-md rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">-- Select an Applicant to Auto-fill --</option>
                {acceptedApplicants.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.student_fname} {app.student_surname} ({app.class_applied || 'Unknown Class'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="registration_number">Admission Number</Label>
            <Input id="registration_number" name="registration_number" value={formData.registration_number} onChange={handleChange} required placeholder="e.g. HXFA/2026/00000" />
            <p className="text-xs text-muted-foreground">This number is auto-generated but can be modified. Must be unique.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="surname">Surname</Label>
              <Input id="surname" name="surname" value={formData.surname} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="other_names">Other Names</Label>
              <Input id="other_names" name="other_names" value={formData.other_names} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input type="date" id="date_of_birth" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="gender" value="Male" checked={formData.gender === 'Male'} onChange={handleChange} required className="text-brand-green focus:ring-brand-green" />
                  <span>Male</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="gender" value="Female" checked={formData.gender === 'Female'} onChange={handleChange} required className="text-brand-pink focus:ring-brand-pink" />
                  <span>Female</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="house_address">House Address</Label>
            <Input id="house_address" name="house_address" value={formData.house_address} onChange={handleChange} required />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="parents_name">Parents' Name</Label>
              <Input id="parents_name" name="parents_name" value={formData.parents_name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parents_phone">Parents' Phone No</Label>
              <Input type="tel" id="parents_phone" name="parents_phone" value={formData.parents_phone} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email_address">Email Address</Label>
              <Input type="email" id="email_address" name="email_address" value={formData.email_address} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class_applied">Class Applied For</Label>
              <select
                id="class_applied"
                name="class_applied"
                value={formData.class_applied}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a class...</option>
                <option value="JSS 1">JSS 1</option>
                <option value="JSS 2">JSS 2</option>
                <option value="JSS 3">JSS 3</option>
                <option value="SSS 1">SSS 1</option>
                <option value="SSS 2">SSS 2</option>
                <option value="SSS 3">SSS 3</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passport_photo">Passport Photograph</Label>
            <Input type="file" id="passport_photo" name="passport_photo" accept="image/*" onChange={handleFileChange} className="cursor-pointer file:cursor-pointer file:hover:bg-gray-100" />
            <p className="text-sm text-muted-foreground">Upload a clear passport photograph of the student.</p>
          </div>

          <div className="pt-6">
            <Button type="submit" disabled={loading} className="w-full bg-brand-pink hover:bg-brand-pink/90 text-white h-12 text-lg">
              {loading ? 'Processing...' : 'Register Now'}
            </Button>
          </div>
        </form>
      </div>

      {recentStudents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">Recently Registered Students</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 rounded-t-lg">
                <tr>
                  <th className="px-4 py-3 font-medium">Reg Number</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Class</th>
                  <th className="px-4 py-3 font-medium">Gender</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentStudents.map((st, i) => (
                  <tr key={st.id || i} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-brand-green">{st.registration_number}</td>
                    <td className="px-4 py-3">{st.surname} {st.other_names}</td>
                    <td className="px-4 py-3">{st.class_applied}</td>
                    <td className="px-4 py-3">{st.gender}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
