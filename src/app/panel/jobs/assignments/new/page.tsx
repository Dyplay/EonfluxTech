'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { databases } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { FiUser, FiCalendar, FiBriefcase, FiSave, FiSearch } from 'react-icons/fi';
import Image from 'next/image';

interface Job {
  $id: string;
  title: string;
  description: string;
  requirements: string;
  deadline: string;
  location: string;
  type: string;
}

interface AppwriteUser {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function NewAssignmentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Form states
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchResults, setSearchResults] = useState<AppwriteUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AppwriteUser | null>(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle authentication and initial data loading
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.prefs?.role !== 'admin') {
      toast.error('You do not have permission to create assignments');
      router.push('/');
      return;
    }

    loadJobs();
  }, [user, authLoading, router]);

  // Load jobs function
  const loadJobs = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'jobs'
      );

      if (response.documents) {
        const activeJobs = response.documents
          .filter(job => job.status === 'active')
          .map(job => ({
            $id: job.$id,
            title: job.title,
            description: job.description,
            requirements: job.requirements,
            deadline: job.deadline,
            location: job.location,
            type: job.type
          }));

        setJobs(activeJobs);
      }
    } catch (error) {
      toast.error('Failed to load jobs');
      console.error('Error loading jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user search
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/users?search=${encodeURIComponent(searchTerm)}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
              'X-Appwrite-Key': process.env.NEXT_PUBLIC_APPWRITE_API_KEY!,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch users');

        const data = await response.json();
        const users = data.users.map((user: any) => ({
          $id: user.$id,
          name: user.name || '',
          email: user.email || '',
          avatar: user.prefs?.avatar || ''
        }));

        setSearchResults(users);
      } catch (error) {
        console.error('Error searching users:', error);
        toast.error('Failed to search users');
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId || !selectedJobId || !deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const selectedJob = jobs.find(job => job.$id === selectedJobId);
      if (!selectedJob || !selectedUser) {
        throw new Error('Selected job or user not found');
      }

      const assignment = {
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

      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'custom_panels',
        ID.unique(),
        assignment
      );

      toast.success('Assignment created successfully!');
      router.push('/panel/jobs/assignments');
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
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
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select User <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full px-4 py-3 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150 ease-in-out pl-10"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" />
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-60 overflow-y-auto border rounded-lg bg-card">
                {searchResults.map((user) => (
                  <button
                    key={user.$id}
                    type="button"
                    onClick={() => {
                      setSelectedUserId(user.$id);
                      setSelectedUser(user);
                      setSearchTerm('');
                      setSearchResults([]);
                    }}
                    className="w-full p-3 text-left hover:bg-accent/50 transition-colors flex items-center gap-3"
                  >
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="rounded-full aspect-square object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <FiUser className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-secondary">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected User */}
            {selectedUser && (
              <div className="mt-2 p-3 bg-accent/50 rounded-lg flex items-center gap-3">
                {selectedUser.avatar ? (
                  <Image
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    width={40}
                    height={40}
                    className="rounded-full aspect-square object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground">{selectedUser.name}</p>
                  <p className="text-sm text-secondary">{selectedUser.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Job Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Job <span className="text-red-500">*</span>
            </label>
            {jobs.length === 0 ? (
              <div className="p-4 border rounded-lg text-center text-secondary">
                No jobs available. Please create some jobs first.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <button
                    key={job.$id}
                    type="button"
                    onClick={() => setSelectedJobId(job.$id)}
                    className={`p-4 border rounded-lg text-left hover:bg-accent/50 transition-colors ${
                      selectedJobId === job.$id ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FiBriefcase className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{job.title}</p>
                        <p className="text-sm text-secondary line-clamp-2 mt-1">
                          {job.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-secondary">
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>{job.type}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Deadline Selection */}
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

          {/* Submit Button */}
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