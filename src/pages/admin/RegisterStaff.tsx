import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function RegisterStaff() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  const [formData, setFormData] = useState({
    staff_number: '',
    surname: '',
    first_name: '',
    other_names: '',
    date_of_birth: '',
    gender: 'Male',
    residential_address: '',
    phone_number: '',
    email_address: '',
    job_category: 'Teaching',
    educational_records: ''
  });

  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const [uploadedCerts, setUploadedCerts] = useState<File[]>([]);
  
  const [employedApplicants, setEmployedApplicants] = useState<any[]>([]);
  const [selectedApplicantId, setSelectedApplicantId] = useState('');

  useEffect(() => {
    fetchEmployedApplicants();
    
    // Auto-generate the next staff number on load
    generateStaffNumber().then(num => {
      setFormData(prev => ({ ...prev, staff_number: num }));
    });
  }, []);

  const fetchEmployedApplicants = async () => {
    try {
      if (!supabase) throw new Error("Supabase is not configured.");
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('application_status', 'Employed');
      
      if (error) {
         console.warn("Error fetching employed applicants");
         return;
      }
      setEmployedApplicants(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const generateStaffNumber = async () => {
    try {
      if (!supabase) return `STF/${currentYear}/001`;
      
      const { data, error } = await supabase
        .from('staff_documentation')
        .select('staff_number')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
          console.warn("Could not generate staff from DB");
      }

      if (data && data.length > 0) {
        const lastNum = data[0].staff_number;
        const parts = lastNum.split('/');
        const lastSeq = parseInt(parts[2], 10);
        return `STF/${currentYear}/${String(lastSeq + 1).padStart(3, '0')}`;
      }
      return `STF/${currentYear}/001`;
    } catch (e) {
      return `STF/${currentYear}/001`;
    }
  };

  const handleApplicantSelect = (id: string) => {
    setSelectedApplicantId(id);
    if (!id) {
      setFormData(prev => ({
        ...prev,
        surname: '',
        first_name: '',
        other_names: '',
        gender: 'Male',
        phone_number: '',
        email_address: '',
        educational_records: '',
        job_category: 'Teaching'
      }));
      return;
    }

    const applicant = employedApplicants.find(a => a.id === id);
    if (applicant) {
      setFormData(prev => ({
        ...prev,
        surname: applicant.surname || '',
        first_name: applicant.other_names ? applicant.other_names.split(' ')[0] : '',
        other_names: applicant.other_names ? applicant.other_names.split(' ').slice(1).join(' ') : '',
        gender: applicant.gender || 'Male',
        phone_number: applicant.phone_number || '',
        email_address: applicant.email_address || '',
        educational_records: applicant.educational_qualifications || '',
        job_category: applicant.job_category || 'Teaching'
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedCerts(Array.from(e.target.files));
    }
  };

  const uploadDocument = async (file: File | null, pathPrefix: string) => {
    if (!file) return null;
    try {
       const fileName = `${pathPrefix}-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
       const { data, error } = await supabase.storage.from('staff_documents').upload(fileName, file);
       if (error) {
          console.warn("Could not upload to supabase storage:", error);
          return URL.createObjectURL(file); // fallback
       }
       const { data: publicUrlData } = supabase.storage.from('staff_documents').getPublicUrl(fileName);
       return publicUrlData.publicUrl;
    } catch(e) {
       console.warn("Storage upload error:", e);
       return URL.createObjectURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!supabase) throw new Error("Supabase is not configured.");

      // Image upload handled similarly (for now we simulate URL or upload if real)
      let photoUrl = await uploadDocument(photoFile, 'photo') || '';
      
      const uploadedCertUrls = [];
      for (const file of uploadedCerts) {
        const url = await uploadDocument(file, 'cert');
        if (url) {
          uploadedCertUrls.push({ name: file.name, url });
        }
      }
      const otherCertsUrl = uploadedCertUrls.length > 0 ? JSON.stringify(uploadedCertUrls) : null;

      const payload = {
        staff_number: formData.staff_number,
        surname: formData.surname,
        first_name: formData.first_name,
        other_names: formData.other_names,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        residential_address: formData.residential_address,
        phone_number: formData.phone_number,
        email_address: formData.email_address,
        educational_records: formData.educational_records,
        job_category: formData.job_category,
        passport_photo_url: photoUrl,
        primary_school_cert_url: null,
        secondary_school_cert_url: null,
        university_degree_url: null,
        other_certificates_url: otherCertsUrl,
      };

      const { error } = await supabase.from('staff_documentation').insert([payload]);

      if (error) {
         throw error;
      }

      toast.success('Staff documented successfully!');
      navigate('/admin/dashboard/staff');

    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to document staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Staff Documentation</h1>
        <p className="text-muted-foreground">Document a newly employed staff member.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
        {employedApplicants.length > 0 && (
          <div className="mb-6 p-4 bg-brand-green/5 rounded-lg border border-brand-green/20">
            <Label htmlFor="applicant_select" className="text-brand-dark-green font-semibold mb-2 block">
              Auto-fill from Employed Applicants
            </Label>
            <select
              id="applicant_select"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedApplicantId}
              onChange={(e) => handleApplicantSelect(e.target.value)}
            >
              <option value="">-- Select an applicant to autofill --</option>
              {employedApplicants.map(app => (
                <option key={app.id} value={app.id}>
                  {app.surname} {app.other_names} - {app.job_category}
                </option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <Label htmlFor="staff_number">Staff Number</Label>
              <Input type="text" id="staff_number" name="staff_number" value={formData.staff_number} readOnly className="bg-gray-50 font-mono" />
              <p className="text-xs text-muted-foreground">Auto-generated</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_category">Job Category</Label>
              <select 
                id="job_category" name="job_category" value={formData.job_category} onChange={handleChange} required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="Teaching">Teaching</option>
                <option value="Non-Teaching">Non-Teaching</option>
                <option value="Operations">Operations</option>
                <option value="Management">Management</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">Surname *</Label>
              <Input type="text" id="surname" name="surname" value={formData.surname} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="other_names">Other Names</Label>
              <Input type="text" id="other_names" name="other_names" value={formData.other_names} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input type="date" id="date_of_birth" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select 
                id="gender" name="gender" value={formData.gender} onChange={handleChange} required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number *</Label>
              <Input type="tel" id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email_address">Email Address *</Label>
              <Input type="email" id="email_address" name="email_address" value={formData.email_address} onChange={handleChange} required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="residential_address">Residential Address</Label>
              <textarea 
                id="residential_address" name="residential_address" value={formData.residential_address} onChange={handleChange} rows={3} required
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="educational_records">Educational Records (Qualifications)</Label>
              <textarea 
                id="educational_records" name="educational_records" value={formData.educational_records} onChange={handleChange} rows={3} required
                placeholder="e.g. B.Sc Computer Science, PGDE"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              />
            </div>

            <div className="space-y-2 md:col-span-2 border-t pt-6">
              <Label htmlFor="passport_photo" className="text-base font-semibold">Passport Photograph</Label>
              <p className="text-sm text-muted-foreground mb-4">A clear photograph of the staff member for the ID card and files.</p>
              <Input type="file" id="passport_photo" name="passport_photo" accept="image/*" onChange={handleFileChange} className="cursor-pointer file:cursor-pointer file:hover:bg-gray-100" />
            </div>

            <div className="space-y-2 md:col-span-2 border-t pt-6">
              <h3 className="text-base font-semibold text-brand-dark-green">Uploaded Certificates</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload all scanned copies of credentials below (you can select multiple files).</p>
              
              <div className="space-y-4">
                <Input type="file" id="certificates" multiple accept="image/*,.pdf" onChange={handleCertFileChange} className="cursor-pointer file:cursor-pointer file:hover:bg-gray-100" />
                
                {uploadedCerts.length > 0 && (
                  <div className="bg-gray-50 border rounded p-4">
                    <h4 className="text-sm font-semibold mb-2">Selected Files:</h4>
                    <ul className="list-disc pl-5 text-sm">
                      {uploadedCerts.map((file, idx) => (
                        <li key={idx} className="text-muted-foreground">{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/dashboard/staff')} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-brand-green hover:bg-brand-green/90 text-white min-w-32">
              {loading ? 'Documenting...' : 'Complete Documentation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
