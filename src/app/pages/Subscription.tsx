import React, { useState } from 'react';
import { useSubscription, UserRole } from '../context/SubscriptionContext';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  UserPlus, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Clock,
  Settings
} from 'lucide-react';

export default function SubscriptionPage() {
  const { 
    user, 
    subscription, 
    teachers, 
    updateSubscription, 
    addTeacher, 
    removeTeacher
  } = useSubscription();

  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', username: '', password: '' });

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeacher.name && newTeacher.email && newTeacher.username && newTeacher.password) {
      const success = await addTeacher(newTeacher);
      if (success) setNewTeacher({ name: '', email: '', username: '', password: '' });
    }
  };

  const isExpired = new Date(subscription.expire_date) < new Date();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* 
        Developer Mode Switcher Removed. 
        Use the main Login page to access different roles.
      */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subscription Status Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-xl ${subscription.status === 'active' ? 'bg-green-50' : 'bg-red-50'}`}>
              <ShieldCheck className={`w-6 h-6 ${subscription.status === 'active' ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">সাবস্ক্রিপশন স্ট্যাটাস</h3>
              <p className="text-sm text-slate-500">স্কুল প্রোফাইল ইনফো</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-slate-600">অবস্থা</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                subscription.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {subscription.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-slate-600">মেয়াদ শেষ</span>
              <span className={`flex items-center gap-1 font-medium ${isExpired ? 'text-red-500' : 'text-slate-700'}`}>
                <Calendar className="w-4 h-4" />
                {subscription.expire_date}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">শিক্ষক সীমা</span>
              <span className="font-bold text-slate-800">
                {subscription.used_teacher_count} / {subscription.teacher_limit}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Controls (Only for Super Admin) */}
        {user?.role === 'super_admin' && (
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl col-span-2">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="text-blue-400" />
              সুপার এডমিন কন্ট্রোল প্যানেল
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm text-slate-400">সাবস্ক্রিপশন এক্টিভেশন</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateSubscription({ status: 'active' })}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 border transition-all ${
                      subscription.status === 'active' ? 'bg-green-600 border-green-600' : 'border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> এক্টিভেট
                  </button>
                  <button
                    onClick={() => updateSubscription({ status: 'inactive' })}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 border transition-all ${
                      subscription.status === 'inactive' ? 'bg-red-600 border-red-600' : 'border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <XCircle className="w-4 h-4" /> ডি-এক্টিভেট
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-sm text-slate-400">এক্সপায়ারি ডেট পরিবর্তন</label>
                <input
                  type="date"
                  value={subscription.expire_date}
                  onChange={(e) => updateSubscription({ expire_date: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm text-slate-400">টিচার লিমিট</label>
                <input
                  type="number"
                  value={subscription.teacher_limit}
                  onChange={(e) => updateSubscription({ teacher_limit: parseInt(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Teacher Management (Only for School Admin) */}
        {user?.role === 'school_admin' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="text-blue-600" />
                শিক্ষক ম্যানেজমেন্ট
              </h3>
              <div className="text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                সীমা: {subscription.used_teacher_count}/{subscription.teacher_limit}
              </div>
            </div>

            <form onSubmit={handleAddTeacher} className="flex flex-col gap-3 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="font-semibold text-slate-700 mb-2">নতুন শিক্ষক যোগ করুন</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="শিক্ষকের নাম"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  className="border border-slate-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="email"
                  placeholder="ইমেইল এড্রেস"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  className="border border-slate-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="ইউজারনেম (লগইন এর জন্য)"
                  value={newTeacher.username}
                  onChange={(e) => setNewTeacher({ ...newTeacher, username: e.target.value })}
                  className="border border-slate-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="password"
                  placeholder="পাসওয়ার্ড"
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                  className="border border-slate-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-100 mt-2"
              >
                <UserPlus className="w-4 h-4" /> শিক্ষক যোগ করুন
              </button>
            </form>

            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 text-sm">
                  <tr>
                    <th className="px-6 py-3 font-semibold">নাম</th>
                    <th className="px-6 py-3 font-semibold">ইমেইল</th>
                    <th className="px-6 py-3 font-semibold text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{teacher.name}</td>
                      <td className="px-6 py-4 text-slate-600">{teacher.email}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => removeTeacher(teacher.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {teachers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                        এখনো কোনো শিক্ষক যোগ করা হয়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Teacher View */}
        {user?.role === 'teacher_user' && (
          <div className="bg-blue-50 p-8 rounded-2xl border-2 border-dashed border-blue-200 col-span-2 flex flex-col items-center justify-center text-center">
            <div className="bg-blue-600 text-white p-4 rounded-full mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">স্বাগতম, {user.name}</h3>
            <p className="text-slate-600 max-w-md">
              আপনি আপনার স্কুলের পক্ষ থেকে প্রশ্ন তৈরি করতে পারবেন। আপনার সাবস্ক্রিপশন স্ট্যাটাস বাম পাশের প্যানেল থেকে দেখে নিন।
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
