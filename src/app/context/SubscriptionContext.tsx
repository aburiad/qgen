import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

// Roles based on WP requirements
export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'teacher_user'; // teacher_user alias for legacy

export interface Teacher {
  id: string;
  name: string;
  email: string;
  username: string;
  parent_school_id: string;
  joinedAt: string;
}

export interface SubscriptionStatus {
  status: 'active' | 'inactive';
  expire_date: string; // YYYY-MM-DD
  teacher_limit: number;
  used_teacher_count: number;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  school_id?: string;
}

interface NewTeacherData {
  name: string;
  email: string;
  username: string;
  password?: string;
}

interface SubscriptionContextType {
  user: UserProfile | null;
  subscription: SubscriptionStatus;
  teachers: Teacher[];
  login: (username: string, password?: string, url?: string) => Promise<boolean>;
  updateSubscription: (data: Partial<SubscriptionStatus>) => void;
  addTeacher: (data: NewTeacherData) => Promise<boolean>;
  removeTeacher: (id: string) => void;
  isSubscriptionValid: () => boolean;
  canPerformAction: () => boolean;
  isLoading: boolean;
  logout: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SUB: 'wp_subscription_meta',
  TEACHERS: 'wp_teachers_data',
  USER: 'wp_current_user'
};

const defaultSubscription: SubscriptionStatus = {
  status: 'inactive',
  expire_date: '2025-12-31',
  teacher_limit: 20,
  used_teacher_count: 0,
};

// API Configuration
const API_BASE = '/wp-json/sqg/v1';

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // State
  const [wpUrl, setWpUrl] = useState<string>(() => localStorage.getItem('wp_site_url') || '');
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [subscription, setSubscription] = useState<SubscriptionStatus>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUB);
    return saved ? JSON.parse(saved) : defaultSubscription;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to API
  const fetchFromAPI = async () => {
    if (!wpUrl || !user) return; // Cannot fetch without URL or User

    try {
      setIsLoading(true);
      const apiBase = `${wpUrl}/wp-json/sqg/v1`;
      
      // 1. Get Status
      // We assume Basic Auth or some token header is stored. 
      // For simplicity in this iteration, we might not have a token yet.
      // Let's assume the plugin is public for status OR we pass the stored token.
      const token = localStorage.getItem('wp_auth_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const statusRes = await fetch(`${apiBase}/status`, { headers });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        // Update subscription
        setSubscription(prev => ({
             ...prev,
             status: statusData.status,
             expire_date: statusData.expire_date,
             teacher_limit: statusData.teacher_limit,
             used_teacher_count: statusData.used_teacher_count
        }));
      }

      // 2. Get Teachers (if school admin)
      if (user?.role === 'school_admin' || user?.role === 'super_admin') {
        const teachersRes = await fetch(`${apiBase}/teachers`, { headers });
        if (teachersRes.ok) {
          const teachersData = await teachersRes.json();
          // Map API response to our Teacher interface
          const mappedTeachers = teachersData.map((t: any) => ({
             id: t.id,
             name: t.name,
             email: t.email,
             username: t.username,
             parent_school_id: user.id,
             joinedAt: t.created_at
          }));
          setTeachers(mappedTeachers);
          setSubscription(prev => ({ ...prev, used_teacher_count: mappedTeachers.length }));
        }
      }

    } catch (error) {
      console.log("API not available, using local mock data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFromAPI();
  }, [user?.role]);

  // Persist changes (Mock Fallback)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUB, JSON.stringify(subscription));
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [subscription, teachers, user]);

  const login = async (username: string, password?: string, url?: string) => {
    // If URL is provided, update it
    let currentUrl = url || wpUrl;
    if (url) setWpUrl(url);

    if (!currentUrl) {
       toast.error("WordPress URL missing");
       return false;
    }

    // Special "Developer Mode" bypass (for testing without real backend)
    if (username === 'dev' && password === 'dev') {
        const mockUser: UserProfile = {
            id: 'dev_1',
            role: 'super_admin',
            name: 'Developer Admin',
            email: 'dev@example.com'
        };
        setUser(mockUser);
        toast.success("Developer Mode Active");
        return true;
    }

    try {
        // Attempt to login via API
        // We will try a standard WP JSON Auth or Custom Endpoint
        // Assumed Endpoint: POST /wp-json/sqg/v1/login { username, password }
        const res = await fetch(`${currentUrl}/wp-json/sqg/v1/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            const data = await res.json();
            // Expected data: { token: '...', user: { ... } }
            localStorage.setItem('wp_auth_token', data.token);
            
            const userData: UserProfile = {
                id: data.user.ID || data.user.id,
                name: data.user.display_name || data.user.name,
                email: data.user.user_email || data.user.email,
                role: data.user.roles.includes('administrator') ? 'school_admin' : 'teacher', 
                // Note: Logic to determine role might need adjustment based on plugin
            };
            setUser(userData);
            toast.success("লগইন সফল হয়েছে");
            return true;
        } else {
             const err = await res.json();
             throw new Error(err.message || 'Login failed');
        }
    } catch (e) {
        console.error("Login Error:", e);
        // If API fails, we can't login.
        toast.error("সার্ভারের সাথে সংযোগ স্থাপন করা যাচ্ছে না বা তথ্য ভুল");
        return false;
    }
  };

  const isSubscriptionValid = () => {
    if (subscription.status !== 'active') return false;
    const today = new Date().toISOString().split('T')[0];
    return subscription.expire_date >= today;
  };

  const canPerformAction = () => {
    if (user?.role === 'super_admin') return true;
    return isSubscriptionValid();
  };

  const updateSubscription = (data: Partial<SubscriptionStatus>) => {
    setSubscription(prev => ({ ...prev, ...data }));
    toast.success('সাবস্ক্রিপশন তথ্য আপডেট করা হয়েছে');
  };

  const addTeacher = async (data: NewTeacherData) => {
    // 1. Try API Call
    try {
      const res = await fetch(`${API_BASE}/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        const result = await res.json();
        // Refresh list
        fetchFromAPI();
        toast.success(result.message || 'শিক্ষক যোগ করা হয়েছে');
        return true;
      }
    } catch (e) {
      // Fallback to Mock
    }

    // Mock Logic
    if (subscription.used_teacher_count >= subscription.teacher_limit) {
      toast.error('শিক্ষক যোগ করার সীমা অতিক্রম করেছে!');
      return false;
    }

    const newTeacher: Teacher = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      email: data.email,
      username: data.username,
      parent_school_id: user?.id || 'unknown',
      joinedAt: new Date().toISOString(),
    };

    setTeachers(prev => [...prev, newTeacher]);
    setSubscription(prev => ({
      ...prev,
      used_teacher_count: prev.used_teacher_count + 1
    }));
    toast.success('শিক্ষক সফলভাবে যোগ করা হয়েছে (Local)');
    return true;
  };

  const removeTeacher = async (id: string) => {
    // 1. Try API
    try {
      const res = await fetch(`${API_BASE}/teachers/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('শিক্ষক মুছে ফেলা হয়েছে');
        fetchFromAPI();
        return;
      }
    } catch(e) {
      // Fallback
    }

    // Mock
    setTeachers(prev => prev.filter(t => t.id !== id));
    setSubscription(prev => ({
      ...prev,
      used_teacher_count: Math.max(0, prev.used_teacher_count - 1)
    }));
    toast.success('শিক্ষককে অপসারণ করা হয়েছে (Local)');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('wp_auth_token');
    toast.success("লগআউট করা হয়েছে");
  };

  return (
    <SubscriptionContext.Provider
      value={{
        user,
        subscription,
        teachers,
        login,
        updateSubscription,
        addTeacher,
        removeTeacher,
        isSubscriptionValid,
        canPerformAction,
        isLoading,
        logout
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
