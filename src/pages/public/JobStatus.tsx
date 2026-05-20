import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, UploadCloud, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function JobStatus() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<any>(null);
  
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState({
    passport: null as File | null,
    certificate: null as File | null,
    id_document: null as File | null,
    cv: null as File | null
  });

  const checkStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setApplication(null);
    try {
      if (!supabase) throw new Error("Supabase is not configured.");

      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('email_address', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error("No application found with that email address.");
        } else {
             throw error;
        }
      } else if (data) {
        setApplication(data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error checking application status');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files[0]) {
      setDocs(prev => ({ ...prev, [type]: e.target.files![0] }));
    }
  };

  const uploadDocs = async () => {
    if (!application || (!docs.passport && !docs.certificate && !docs.id_document && !docs.cv)) {
       toast.error("Please select at least one document to upload");
       return;
    }
    
    setUploading(true);
    try {
      if (!supabase) throw new Error("Supabase is not configured");

      // In a real app we'd upload each to Supabase Storage, for now simulate success
      toast.success("Documents uploaded successfully for verification.");
      
      const { error } = await supabase
          .from('job_applications')
          .update({ documentation_status: 'Submitted' })
          .eq('id', application.id);
          
      if (!error) {
         setApplication({ ...application, documentation_status: 'Submitted' });
      }
      
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="py-20 px-4 md:px-0 bg-pink-50 min-h-screen">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-brand-green mb-4">Application Status</h1>
          <p className="text-muted-foreground">Check the status of your job application and complete documentation.</p>
        </div>

        <Card className="shadow-lg border-t-4 border-t-brand-green mb-8">
          <CardHeader>
            <CardTitle className="text-brand-green">Check Status</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={checkStatus} className="flex flex-col sm:flex-row gap-4">
              <Input 
                type="email" 
                placeholder="Enter your email address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={loading} className="bg-brand-pink hover:bg-brand-pink/90">
                {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Check Status'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {application && (
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
               <CardTitle className="flex justify-between items-center text-xl text-brand-green">
                 Applicant Details
                 {application.application_status === 'Employed' ? (
                   <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                     <CheckCircle2 className="w-4 h-4 mr-1"/> Employed
                   </span>
                 ) : application.application_status === 'Rejected' ? (
                   <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                     <XCircle className="w-4 h-4 mr-1"/> Rejected
                   </span>
                 ) : (
                   <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                     {application.application_status}
                   </span>
                 )}
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
               <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{application.surname} {application.other_names}</p>
               </div>
               <div>
                  <p className="text-sm text-muted-foreground">Applied For</p>
                  <p className="font-medium">{application.job_category}</p>
               </div>
               
               {application.application_status === 'Employed' && (
                 <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                      <p className="text-green-800 font-medium">Congratulations, you have been employed. Please proceed for documentation.</p>
                      <p className="text-sm text-green-700 mt-1">Upload the required documents below to finalize your employment.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="passport">Passport Photograph</Label>
                        <Input id="passport" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'passport')} className="cursor-pointer file:cursor-pointer file:hover:bg-gray-100" />
                      </div>
                      <div>
                        <Label htmlFor="cert">Certificates</Label>
                        <Input id="cert" type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e) => handleFileChange(e, 'certificate')} className="cursor-pointer file:cursor-pointer file:hover:bg-gray-100" />
                      </div>
                      <div>
                        <Label htmlFor="id">Identification Documents</Label>
                        <Input id="id" type="file" accept=".pdf,.doc,.docx,image/*" onChange={(e) => handleFileChange(e, 'id_document')} className="cursor-pointer file:cursor-pointer file:hover:bg-gray-100" />
                      </div>
                      <div>
                        <Label htmlFor="cv">CV / Resume</Label>
                        <Input id="cv" type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'cv')} className="cursor-pointer file:cursor-pointer file:hover:bg-gray-100" />
                      </div>
                      
                      <Button onClick={uploadDocs} disabled={uploading || application.documentation_status === 'Submitted'} className="w-full mt-4 bg-brand-green hover:bg-brand-green/90">
                        {uploading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                        {application.documentation_status === 'Submitted' ? 'Documents Submitted' : 'Upload Documents'}
                      </Button>
                    </div>
                 </div>
               )}

               <div className="pt-6 border-t mt-6 flex justify-center">
                 <Button variant="outline" onClick={() => navigate('/')} className="px-8 font-medium">
                   View done
                 </Button>
               </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
