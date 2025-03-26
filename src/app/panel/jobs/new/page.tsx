'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { databases } from '@/lib/appwrite';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { FiSave, FiX, FiAlertCircle } from 'react-icons/fi';
import dynamic from 'next/dynamic';

// Dynamically import the editor to avoid SSR issues
const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

interface JobFormData {
  title: string;
  description: string;
  requirements: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  deadline: string;
  status: 'active' | 'draft' | 'closed';
}

export default function NewJobPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    requirements: '',
    location: '',
    type: 'full-time',
    salary: {
      min: 0,
      max: 0,
      currency: 'USD'
    },
    deadline: '',
    status: 'draft'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const jobData = {
        ...formData,
        createdBy: user.$id,
        createdByName: user.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'jobs',
        'unique()',
        jobData
      );

      toast.success('Job created successfully');
      router.push('/panel/jobs');
    } catch (error) {
      console.error('Error creating job:', error);
      setError('Failed to create job');
      toast.error('Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('salary.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        salary: {
          ...prev.salary,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-card rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Create New Job</h2>
          <button
            onClick={() => router.push('/panel/jobs')}
            className="btn btn-accent flex items-center gap-2"
          >
            <FiX className="w-4 h-4" />
            Cancel
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-lg mb-6 flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Job Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g., Senior Software Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Job Description
            </label>
            <Editor
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Enter job description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Requirements
            </label>
            <Editor
              value={formData.requirements}
              onChange={(value) => setFormData(prev => ({ ...prev, requirements: value }))}
              placeholder="Enter job requirements..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., New York, NY"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Job Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Minimum Salary
              </label>
              <input
                type="number"
                name="salary.min"
                value={formData.salary.min}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Maximum Salary
              </label>
              <input
                type="number"
                name="salary.max"
                value={formData.salary.max}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Currency
              </label>
              <select
                name="salary.currency"
                value={formData.salary.currency}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Application Deadline
              </label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/panel/jobs')}
              className="btn btn-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Create Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
} 