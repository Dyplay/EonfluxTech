'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import AdminGuard from '@/app/components/AdminGuard';
import AdminNav from '@/app/components/admin/AdminNav';
import UserListTable from '@/app/components/admin/UserListTable';
import { getAllUsers, UserListItem } from '@/lib/admin';

export default function UsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching all users...');
      const usersData = await getAllUsers();
      setUsers(usersData);
      console.log(`Loaded ${usersData.length} users`);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserUpdated = () => {
    fetchUsers(); // Refresh the user list after an action
  };

  return (
    <AdminGuard>
      <AdminNav />
      <div className="container max-w-7xl py-8">
        <Toaster position="top-right" />
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">
            View and manage all registered users in your application
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md"
          >
            <p>{error}</p>
          </motion.div>
        )}

        <UserListTable 
          users={users} 
          loading={loading} 
          onUserUpdated={handleUserUpdated} 
        />
      </div>
    </AdminGuard>
  );
} 