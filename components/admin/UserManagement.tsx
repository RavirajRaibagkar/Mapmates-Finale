'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Ban, CheckCircle, Shield, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data as User[]);
  };

  const toggleBan = async (userId: string, currentStatus: boolean) => {
    await (supabase as any)
      .from('profiles')
      .update({ is_banned: !currentStatus })
      .eq('id', userId);
    
    toast.success(currentStatus ? 'User unbanned' : 'User banned');
    fetchUsers();
  };

  const toggleVerify = async (userId: string, currentStatus: boolean) => {
    await (supabase as any)
      .from('profiles')
      .update({ is_verified: !currentStatus })
      .eq('id', userId);
    
    toast.success(currentStatus ? 'Verification removed' : 'User verified');
    fetchUsers();
  };

  const toggleAdmin = async (userId: string, currentRole: string) => {
    await (supabase as any)
      .from('profiles')
      .update({ role: currentRole === 'admin' ? 'user' : 'admin' })
      .eq('id', userId);
    
    toast.success('Role updated');
    fetchUsers();
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">User Management</h2>

      <Input
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Mapos</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{user.avatar_emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{user.username}</p>
                      <p className="text-sm text-gray-500">Level {user.level}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-purple-600">{user.mapos} 💎</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {user.is_verified && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                        Verified
                      </span>
                    )}
                    {user.is_banned && (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                        Banned
                      </span>
                    )}
                    {user.role === 'admin' && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                        Admin
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleBan(user.id, user.is_banned)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title={user.is_banned ? 'Unban' : 'Ban'}
                    >
                      <Ban className={`w-5 h-5 ${user.is_banned ? 'text-red-600' : 'text-gray-400'}`} />
                    </button>
                    <button
                      onClick={() => toggleVerify(user.id, user.is_verified)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title={user.is_verified ? 'Remove verification' : 'Verify'}
                    >
                      <CheckCircle className={`w-5 h-5 ${user.is_verified ? 'text-blue-600' : 'text-gray-400'}`} />
                    </button>
                    <button
                      onClick={() => toggleAdmin(user.id, user.role)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                    >
                      <Shield className={`w-5 h-5 ${user.role === 'admin' ? 'text-purple-600' : 'text-gray-400'}`} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
