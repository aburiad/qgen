import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { toast } from 'sonner';
import { supabase } from '../utils/supabaseClient';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const location = useLocation();
  const isCheckingRef = useRef(false);

  // Function to validate session directly from table
  const validateSessionFromTable = async (email: string, token: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('user_email', email)
        .eq('session_token', token)
        .eq('is_active', true);

      if (error) {
        console.error('Session validation error:', error);
        return false;
      }

      // If data is empty array, session is invalid
      if (!data || data.length === 0) {
        return false;
      }
      return true;
    } catch (err) {
      console.error('Session validation error:', err);
      return false;
    }
  };

  // Function to check and invalidate session if needed
  const checkSession = async () => {
    // Prevent multiple simultaneous checks
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    try {
      const storedToken = localStorage.getItem('sessionToken');
      const storedEmail = localStorage.getItem('userEmail');

      // Get Supabase auth session
      const { data } = await supabase.auth.getSession();

      // If no auth session, invalid
      if (!data.session) {
        setIsValid(false);
        setIsVerifying(false);
        return;
      }

      // If we have stored session token, validate it
      if (storedToken && storedEmail) {
        const isValidSession = await validateSessionFromTable(storedEmail, storedToken);

        if (!isValidSession) {
          // Session is invalid - user logged in from another device
          console.log('Session invalid - logged in from another device');
          
          // Clear local storage
          localStorage.removeItem('sessionToken');
          localStorage.removeItem('userEmail');
          
          // Sign out from Supabase
          await supabase.auth.signOut();
          
          toast.error('আপনি অন্য ডিভাইসে লগইন করেছেন। এই ডিভাইস থেকে লগআউট করা হয়েছে।');
          setIsValid(false);
          setIsVerifying(false);
          return;
        }
      }

      setIsValid(true);
      setIsVerifying(false);
    } finally {
      isCheckingRef.current = false;
    }
  };

  useEffect(() => {
    // Initial check
    checkSession();

    // Set up periodic session check (every 10 seconds)
    const intervalId = setInterval(() => {
      checkSession();
    }, 10000);

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('userEmail');
        setIsValid(false);
      } else if (event === 'SIGNED_IN' && session) {
        // On sign in, run the check
        checkSession();
      }
    });

    return () => {
      clearInterval(intervalId);
      subscription.unsubscribe();
    };
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
