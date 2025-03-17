'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiSearch, FiChevronDown, FiChevronUp, FiShield, FiTrash2, FiLock, FiUnlock } from 'react-icons/fi';
import { UserListItem, performUserAction, UserAction } from '@/lib/admin';
import { toast } from 'react-hot-toast';

interface UserListTableProps {
  users: UserListItem[];
  loading: boolean;
  onUserUpdated: () => void;
}

export default function UserListTable({ users, loading, onUserUpdated }: UserListTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof UserListItem>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort users based on sort field and direction
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortField === 'createdAt') {
      return sortDirection === 'asc' 
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime();
    }
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return sortDirection === 'asc'
        ? (aValue ? 1 : 0) - (bValue ? 1 : 0)
        : (bValue ? 1 : 0) - (aValue ? 1 : 0);
    }
    
    return 0;
  });
  
  const handleSort = (field: keyof UserListItem) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const SortIcon = ({ field }: { field: keyof UserListItem }) => {
    if (field !== sortField) return null;
    
    return sortDirection === 'asc' 
      ? <FiChevronUp className="ml-1 h-4 w-4" /> 
      : <FiChevronDown className="ml-1 h-4 w-4" />;
  };

  const handleUserAction = async (userId: string, action: UserAction) => {
    if (actionInProgress === userId) return;
    
    // Confirm before deleting
    if (action === 'delete') {
      if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
      }
    }
    
    setActionInProgress(userId);
    
    try {
      const result = await performUserAction(userId, action);
      
      if (result.success) {
        toast.success(result.message);
        onUserUpdated(); // Refresh the user list
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Failed to ${action} user`);
      console.error(`Error performing ${action}:`, error);
    } finally {
      setActionInProgress(null);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-lg border border-border p-6 shadow-sm"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h3 className="text-lg font-medium mb-2 md:mb-0">Registered Users</h3>
        
        <div className="relative w-full md:w-64">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="p-4 bg-amber-500/10 text-amber-500 rounded-md">
          <p>No users found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    <SortIcon field="name" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    <SortIcon field="email" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Joined
                    <SortIcon field="createdAt" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer"
                  onClick={() => handleSort('emailVerification')}
                >
                  <div className="flex items-center">
                    Verified
                    <SortIcon field="emailVerification" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    <SortIcon field="status" />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer"
                  onClick={() => handleSort('hasGumroadConnection')}
                >
                  <div className="flex items-center">
                    Gumroad
                    <SortIcon field="hasGumroadConnection" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm">{user.name}</td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-sm">
                    {user.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {user.emailVerification ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <FiCheck className="mr-1 h-3 w-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        <FiX className="mr-1 h-3 w-3" />
                        Not Verified
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {user.status ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <FiCheck className="mr-1 h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        <FiX className="mr-1 h-3 w-3" />
                        Blocked
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {user.hasGumroadConnection ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <FiCheck className="mr-1 h-3 w-3" />
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        <FiX className="mr-1 h-3 w-3" />
                        Not Connected
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      {!user.emailVerification && (
                        <button
                          onClick={() => handleUserAction(user.id, 'verify')}
                          disabled={actionInProgress === user.id}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Verify Email"
                        >
                          <FiShield className="h-4 w-4" />
                        </button>
                      )}
                      
                      {user.status ? (
                        <button
                          onClick={() => handleUserAction(user.id, 'block')}
                          disabled={actionInProgress === user.id}
                          className="p-1 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                          title="Block User"
                        >
                          <FiLock className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction(user.id, 'unblock')}
                          disabled={actionInProgress === user.id}
                          className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                          title="Unblock User"
                        >
                          <FiUnlock className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleUserAction(user.id, 'delete')}
                        disabled={actionInProgress === user.id}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Delete User"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      )}
    </motion.div>
  );
} 