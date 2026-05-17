import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from 'react-router-dom';

export default function Jobs() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    surname: '',
    other_names: '',
    phone_number: '',
    email_address: '',
    gender: 'Male',
    job_category: 'Teaching Jobs'
  });
  
  const [selectedQualifications, setSelectedQualifications] = useState<string[]>([]);
  
  const teachingQuads = ["B.ED", "NCE Ed", "TC2", "TCN"];
  const nonTeachingQuads = ["WAEC", "NECO", "Junior NECO", "NABTEB"];

  const currentQuads = formData.job_category === 'Teaching Jobs' ? teachingQuads : nonTeachingQuads;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuadToggle = (qual: string) => {
    setSelectedQualifications(prev => 
      prev.includes(qual) ? prev.filter(q => q !== qual) : [...prev, qual]
    );
  };
  
  // Reset qualifications when category changes
  const handleCategoryChange = (val: string) => {
    setFormData(prev => ({ ...prev, job_category: val }));
    setSelectedQualifications([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.surname || !formData.phone_number || !formData.email_address) {
      toast.error('Please fill all required fields');
      return;
    }

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
      toast.error('Please enter a valid name.');
      return;
    }

    if (formData.phone_number.length < 5) {
      toast.error('Please enter a valid phone number.');
      return;
    }
    
    if (selectedQualifications.length === 0) {
      toast.error('Please select at least one qualification');
      return;
    }

    setLoading(true);
    try {
      if (!supabase) throw new Error("Supabase is not configured");

      // Check if email already applied
      let isDuplicate = false;
      const { data: existingApp, error: checkError } = await supabase
        .from('job_applications')
        .select('*')
        .eq('email_address', formData.email_address)
        .single();
        
      if (existingApp) {
        isDuplicate = true;
      }
      
      const localApps = JSON.parse(localStorage.getItem('local_job_applications') || '[]');
      if (localApps.some((a: any) => a.email_address === formData.email_address)) {
        isDuplicate = true;
      }

      if (isDuplicate) {
        toast.error('An application with this email already exists.');
        setLoading(false);
        return;
      }
      
      const payload = {
        ...formData,
        educational_qualifications: selectedQualifications.join(', '), // fallback text field
        selected_qualifications: selectedQualifications,
        application_status: 'Pending',
        documentation_status: 'Pending'
      };

      const { error } = await supabase
        .from('job_applications')
        .insert([payload]);

      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('schema cache') || error.code?.startsWith('PGRST')) {
            console.warn("job_applications table missing or schema cache issue. Using local storage");
            const currentLocalApps = JSON.parse(localStorage.getItem('local_job_applications') || '[]');
            payload.id = Date.now().toString();
            payload.created_at = new Date().toISOString();
            currentLocalApps.push(payload);
            localStorage.setItem('local_job_applications', JSON.stringify(currentLocalApps));
        } else {
            throw error;
        }
      }

      toast.success('Your job application has been submitted successfully!');
      
      // Reset form
      setFormData({
        surname: '',
        other_names: '',
        phone_number: '',
        email_address: '',
        gender: 'Male',
        job_category: 'Teaching Jobs'
      });
      setSelectedQualifications([]);
      
      navigate('/jobs/status');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred while submitting application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 px-4 md:px-0 bg-pink-50 min-h-screen">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-brand-green mb-4">Join Our Team</h1>
          <p className="text-muted-foreground text-lg mb-4">Apply for Teaching and Non-Teaching positions at Hopexavier First Academy.</p>
          <Link to="/jobs/status" className="text-brand-pink font-medium hover:underline">Check Application Status / Add Documentation</Link>
        </div>

        <Card className="shadow-lg border-t-4 border-t-brand-green">
          <CardHeader>
            <CardTitle className="text-2xl text-brand-green">Job Application Form</CardTitle>
            <CardDescription>We are an equal opportunity employer. Fill the form accurately.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="surname">Surname *</Label>
                  <Input id="surname" name="surname" value={formData.surname} onChange={handleChange} required placeholder="Enter surname" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="other_names">Other Names</Label>
                  <Input id="other_names" name="other_names" value={formData.other_names} onChange={handleChange} placeholder="Enter other names" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <Label htmlFor="email_address">Email Address *</Label>
                  <Input type="email" id="email_address" name="email_address" value={formData.email_address} onChange={handleChange} required placeholder="example@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number *</Label>
                  <Input id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} required placeholder="080..." />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Gender</Label>
                <RadioGroup 
                  onValueChange={(val) => setFormData(prev => ({...prev, gender: val}))} 
                  value={formData.gender}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <Label className="text-base font-semibold">Job Category</Label>
                <RadioGroup 
                  onValueChange={handleCategoryChange} 
                  value={formData.job_category}
                  className="flex gap-6 flex-wrap"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Teaching Jobs" id="teaching" />
                    <Label htmlFor="teaching">Teaching Jobs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Non-Teaching Jobs" id="non_teaching" />
                    <Label htmlFor="non_teaching">Non-Teaching Jobs</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <Label className="font-semibold">{formData.job_category} Qualifications</Label>
                <p className="text-xs text-muted-foreground pb-2">Select all that apply</p>
                <div className="grid grid-cols-2 gap-4">
                  {currentQuads.map(qual => (
                    <div key={qual} className="flex items-center space-x-2">
                      <Checkbox 
                        id={qual} 
                        checked={selectedQualifications.includes(qual)}
                        onCheckedChange={() => handleQuadToggle(qual)}
                      />
                      <Label htmlFor={qual} className="cursor-pointer">{qual}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-brand-green hover:bg-brand-green/90 text-white h-12 mt-6">
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
