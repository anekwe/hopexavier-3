import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Apply() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    student_fname: '',
    student_surname: '',
    dob: '',
    gender: '',
    class_applied: '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    address: '',
    prev_school: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Spam Protection / Dummy Data Validation
    const isDummyData = (str: string) => {
      const lower = str.toLowerCase().trim();
      if (lower.length < 2) return true;
      if (lower === 'test' || lower === 'dummy' || lower === 'none' || lower === 'nil') return true;
      if (/^(.)\1+$/.test(lower)) return true; // e.g., "xx", "yyy"
      return false;
    };

    if (isDummyData(formData.student_fname) || isDummyData(formData.student_surname)) {
      toast.error('Please enter a valid student name.');
      return;
    }

    if (isDummyData(formData.parent_name)) {
      toast.error('Please enter a valid parent name.');
      return;
    }

    if (formData.parent_phone.length < 5) {
      toast.error('Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    const payload = {
      ...formData,
      status: 'Pending'
    };

    try {
      const { error: dbError } = await supabase.from('applications').insert([payload]);
      if (dbError) throw dbError;
      
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (error: any) {
      console.error("Supabase insert error:", error);
      toast.error(`Failed to submit application: ${error?.message || 'Database error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-32 container px-4 mx-auto max-w-2xl text-center">
        <div className="bg-brand-green/10 p-12 rounded-3xl border border-brand-green/20">
          <h2 className="text-3xl font-bold text-brand-green mb-4">Application Received!</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for applying to hopexavier first academy. Your application has been successfully submitted and is currently marked as pending. Our admissions team will review your details and contact you shortly with the next steps.
          </p>
          <Button onClick={() => window.location.href = '/'} className="bg-brand-pink text-white hover:bg-brand-pink/90 font-semibold px-8 h-12">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-muted/20">
      <div className="container px-4 mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-brand-green">Student Application</h1>
          <p className="text-muted-foreground">Complete the form below to apply for admission to hopexavier first academy.</p>
        </div>

        <div className="bg-card p-6 md:p-10 rounded-3xl shadow-xl border border-border">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Student Info Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-brand-green border-b pb-2">Student Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="student_fname">First Name</Label>
                  <Input required id="student_fname" name="student_fname" value={formData.student_fname} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student_surname">Surname</Label>
                  <Input required id="student_surname" name="student_surname" value={formData.student_surname} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input required type="date" id="dob" name="dob" value={formData.dob} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select required onValueChange={(v: string) => handleSelectChange('gender', v)}>
                    <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="class_applied">Class Applying For</Label>
                  <Select required onValueChange={(v: string) => handleSelectChange('class_applied', v)}>
                    <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JS1">JS 1 (JSS 1)</SelectItem>
                      <SelectItem value="JS2">JS 2 (JSS 2)</SelectItem>
                      <SelectItem value="JS3">JS 3 (JSS 3)</SelectItem>
                      <SelectItem value="SS1">SS 1</SelectItem>
                      <SelectItem value="SS2">SS 2</SelectItem>
                      <SelectItem value="SS3">SS 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="prev_school">Previous School Attended</Label>
                  <Input required id="prev_school" name="prev_school" value={formData.prev_school} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Parent Info Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-brand-green border-b pb-2">Parent / Guardian Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="parent_name">Parent/Guardian Full Name</Label>
                  <Input required id="parent_name" name="parent_name" value={formData.parent_name} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent_phone">Phone Number</Label>
                  <Input required type="tel" id="parent_phone" name="parent_phone" value={formData.parent_phone} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent_email">Email Address</Label>
                  <Input required type="email" id="parent_email" name="parent_email" value={formData.parent_email} onChange={handleChange} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Residential Address</Label>
                  <Textarea required id="address" name="address" value={formData.address} onChange={handleChange} />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 bg-brand-pink text-white hover:bg-brand-pink/90 text-lg font-bold transition-colors">
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
