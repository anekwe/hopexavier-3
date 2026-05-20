import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/admin/dashboard" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Login successful. Redirecting...');
      } else {
        throw new Error("Supabase is not configured yet.");
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAdminPassword('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation rules
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordMatch = password === confirmPassword;
    const isAdminApproved = adminPassword === 'prince_1981';

    if (!isValidEmail || !isPasswordMatch || !isAdminApproved) {
      toast.error("NO APPROVAL TO BE AN ADMIN");
      setIsRegistering(false); // Redirect to login page
      resetForm();             // Empty fields
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            throw error;
        }
        
        toast.success('Registration successful. You can now log in.');
        setIsRegistering(false);
      } else {
        throw new Error("Supabase is not configured yet.");
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-border">
        <div className="bg-brand-dark-green p-8 text-center text-white">
          <div className="flex justify-center mb-4">
            <img src="https://i.ibb.co/mrtDMPDF/p2.png" alt="p2" border="0" className="h-16 w-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold font-heading">
            {isRegistering ? 'Admin Registration' : 'Admin Portal'}
          </h1>
          <p className="text-white/80 mt-2 text-sm">hopexavier first academy</p>
        </div>
        <div className="p-8">
          {!isRegistering ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input required type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="hopexavier@gmail.com" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input required type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="h-12" />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-brand-pink text-white hover:bg-brand-pink/90 text-lg transition-colors font-semibold">
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email address</Label>
                <Input required type="email" id="reg-email" value={email} onChange={e => setEmail(e.target.value)} placeholder="hopexavier@gmail.com" className="h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">New password</Label>
                <Input required type="password" id="reg-password" value={password} onChange={e => setPassword(e.target.value)} className="h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-confirm">Confirm password</Label>
                <Input required type="password" id="reg-confirm" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-pass">Admin password</Label>
                <Input required type="password" id="admin-pass" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="System Admin Password" className="h-10" />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-brand-pink text-white hover:bg-brand-pink/90 text-lg transition-colors font-semibold mt-2">
                {loading ? 'Registering...' : 'Register as Admin'}
              </Button>
            </form>
          )}
          <div className="mt-6 text-center text-sm text-muted-foreground flex flex-col space-y-2">
             <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  resetForm();
                }}
                className="text-brand-green hover:underline cursor-pointer"
             >
               {isRegistering ? 'Already an admin? Log in here.' : 'No access? Register as an admin.'}
             </button>
             <span>
               Return to <Link to="/" className="text-brand-green hover:underline">public website</Link>
             </span>
          </div>
        </div>
      </div>
    </div>
  );
}
