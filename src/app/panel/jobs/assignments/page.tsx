'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { FiUser, FiBriefcase, FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiPlus } from 'react-icons/fi';
import Link from 'next/link';

interface Assignment {
  $id: string;
  userId: string;
  userName: string;
  userEmail: string;
  jobId: string;
  jobTitle: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  createdByName: string;
}

export default function AssignmentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && !authLoading) {
      const userRole = user.prefs?.role || 'user';
      if (userRole !== 'admin') {
        toast.error('You do not have permission to view assignments');
        router.push('/');
        return;
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'custom_panels'
        );
        setAssignments(response.documents as Assignment[]);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        setError('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchAssignments();
    }
  }, [authLoading, user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'in_progress':
        return 'text-blue-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="w-5 h-5" />;
      case 'in_progress':
        return <FiClock className="w-5 h-5" />;
      case 'cancelled':
        return <FiXCircle className="w-5 h-5" />;
      default:
        return <FiClock className="w-5 h-5" />;
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Link
            href="/panel/jobs/assignments/new"
            className="btn btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            New Assignment
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {filteredAssignments.map((assignment) => (
          <motion.div
            key={assignment.$id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium text-foreground">{assignment.userName}</h3>
                </div>
                <p className="text-secondary">{assignment.userEmail}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 ${getStatusColor(assignment.status)}`}>
                  {getStatusIcon(assignment.status)}
                  {assignment.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <FiBriefcase className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-secondary">Job</p>
                  <p className="text-foreground">{assignment.jobTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FiCalendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-secondary">Deadline</p>
                  <p className="text-foreground">
                    {new Date(assignment.deadline).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => router.push(`/career/panel/${assignment.$id}`)}
                className="btn btn-primary"
              >
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-secondary">No assignments found</p>
        </div>
      )}
    </motion.div>
  );
} 