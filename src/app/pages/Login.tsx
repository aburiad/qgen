import { Loader2, Lock, User } from 'lucide-react';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { supabase } from '../utils/supabaseClient';

// Generate a unique session token
const generateSessionToken = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const createSession = async (email: string, token: string) => {
    try {
      // First deactivate old sessions
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_email', email)
        .eq('is_active', true);

      // Then insert new session
      const deviceInfo = navigator.userAgent.substring(0, 255);
      
      const { error } = await supabase
        .from('user_sessions')
        .insert({
          user_email: email,
          session_token: token,
          device_info: deviceInfo,
          is_active: true
        });

      if (error) {
        console.warn('Session creation warning:', error);
      }
    } catch (err) {
      console.error('Session creation error:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !password) {
        toast.error('Email এবং password দুটোই দরকার');
        return;
      }

      // Perform Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        toast.error(error?.message || 'Login failed. Please check your credentials.');
        return;
      }

      // Generate session token and create session in database
      const sessionToken = generateSessionToken();
      await createSession(email, sessionToken);

      // Store session info
      localStorage.setItem('userEmail', email);
      localStorage.setItem('sessionToken', sessionToken);
      
      toast.success('Successfully logged in');
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err?.message || 'Connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-500 text-base">
            Sign in to access the Question Paper Generator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="text-sm font-medium text-gray-700 block"
              >
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="teacher@school.edu.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 text-base"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="text-sm font-medium text-gray-700 block"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 text-base"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Access Dashboard'
              )}
            </Button>

            <p className="text-xs text-center text-gray-500 mt-6 px-4 leading-relaxed">
              Restricted access for registered teachers only. Ask your administrator if you don't have an account.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
