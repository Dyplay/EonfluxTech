'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { databases, account } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { FiUser, FiCalendar, FiBriefcase, FiSave } from 'react-icons/fi';

interface Job {
  $id: string;
  title: string;
  description: string;
  requirements: string;
  deadline: string;
}

interface User {
  $id: string;
  name: string;
  email: string;
  labels: string[];
}

export default function NewAssignmentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && !authLoading) {
      const userRole = user.prefs?.role || 'user';
      if (userRole !== 'admin') {
        toast.error('You do not have permission to create assignments');
        router.push('/');
        return;
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'jobs'
        );
        setJobs(response.documents as Job[]);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to load jobs');
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'users'
        );
        setUsers(response.documents as User[]);
        setFilteredUsers(response.documents as User[]);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      }
    };

    if (!authLoading && user) {
      fetchJobs();
      fetchUsers();
    }
  }, [authLoading, user]);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedJobId || !deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading('Creating assignment...');

      // Get the selected job and user
      const selectedJob = jobs.find(job => job.$id === selectedJobId);
      const selectedUser = users.find(user => user.$id === selectedUserId);

      if (!selectedJob || !selectedUser) {
        throw new Error('Selected job or user not found');
      }

      // Create custom panel document
      const panelData = {
        userId: selectedUserId,
        userName: selectedUser.name,
        userEmail: selectedUser.email,
        jobId: selectedJobId,
        jobTitle: selectedJob.title,
        jobDescription: selectedJob.description,
        jobRequirements: selectedJob.requirements,
        deadline: deadline,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.$id,
        createdByName: user?.name
      };

      const newPanel = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'custom_panels',
        ID.unique(),
        panelData
      );

      toast.success('Assignment created successfully!');
      router.push('/panel/jobs/assignments');
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-card rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">Create New Assignment</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select User <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full px-4 py-3 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150 ease-in-out"
              />
            </div>
            <div className="mt-2 max-h-60 overflow-y-auto border rounded-lg">
              {filteredUsers.map((user) => (
                <div
                  key={user.$id}
                  onClick={() => setSelectedUserId(user.$id)}
                  className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                    selectedUserId === user.$id ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FiUser className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-secondary">{user.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Job <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <div
                  key={job.$id}
                  onClick={() => setSelectedJobId(job.$id)}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                    selectedJobId === job.$id ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FiBriefcase className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-secondary line-clamp-2">{job.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Deadline <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-3 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150 ease-in-out"
              />
              <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary" />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !selectedUserId || !selectedJobId || !deadline}
              className="btn btn-primary flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Create Assignment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
} 