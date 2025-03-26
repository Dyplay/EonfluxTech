'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { FiUser, FiBriefcase, FiCalendar, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

interface Panel {
  $id: string;
  userId: string;
  userName: string;
  userEmail: string;
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  jobRequirements: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
}

export default function CustomPanelPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPanel = async () => {
      if (!user) return;

      try {
        const response = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'custom_panels',
          params.id as string
        );

        const panelData = response as Panel;

        // Check if user has access
        const isAdmin = user.prefs?.role === 'admin';
        const isAssignedUser = panelData.userId === user.$id;

        if (!isAdmin && !isAssignedUser) {
          toast.error('You do not have permission to view this panel');
          router.push('/');
          return;
        }

        setPanel(panelData);
      } catch (error) {
        console.error('Error fetching panel:', error);
        setError('Failed to load panel data');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchPanel();
    }
  }, [user, authLoading, params.id, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-secondary">Loading panel...</p>
        </div>
      </div>
    );
  }

  if (error || !panel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FiXCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-foreground">{error || 'Panel not found'}</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-card rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{panel.jobTitle}</h1>
              <div className="flex items-center gap-2 text-secondary">
                <span className={`flex items-center gap-1 ${getStatusColor(panel.status)}`}>
                  {getStatusIcon(panel.status)}
                  {panel.status.replace('_', ' ')}
                </span>
                <span>•</span>
                <span>Created by {panel.createdByName}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-secondary">Deadline</div>
              <div className="flex items-center gap-1 text-foreground">
                <FiCalendar className="w-4 h-4" />
                {new Date(panel.deadline).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiUser className="w-5 h-5 text-primary" />
                <h2 className="font-medium text-foreground">Assigned To</h2>
              </div>
              <p className="text-foreground">{panel.userName}</p>
              <p className="text-sm text-secondary">{panel.userEmail}</p>
            </div>

            <div className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiBriefcase className="w-5 h-5 text-primary" />
                <h2 className="font-medium text-foreground">Job Details</h2>
              </div>
              <p className="text-foreground">{panel.jobTitle}</p>
              <p className="text-sm text-secondary line-clamp-2">{panel.jobDescription}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-medium text-foreground">Requirements</h2>
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: panel.jobRequirements }} />
            </div>
          </div>

          {user?.prefs?.role === 'admin' && (
            <div className="mt-6 pt-6 border-t">
              <h2 className="font-medium text-foreground mb-4">Admin Actions</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Add update status functionality
                    toast.info('Status update functionality coming soon');
                  }}
                  className="btn bg-primary hover:bg-primary/90"
                >
                  Update Status
                </button>
                <button
                  onClick={() => {
                    // Add edit functionality
                    toast.info('Edit functionality coming soon');
                  }}
                  className="btn bg-accent hover:bg-accent/90"
                >
                  Edit Assignment
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 