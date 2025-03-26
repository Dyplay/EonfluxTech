'use client';

import { useState, useEffect } from 'react';
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface JobPost {
  $id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  payment: number;
  createdAt: string;
}

export default function AdminJobsPage() {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [payment, setPayment] = useState('');
  const auth = useAuth();

  useEffect(() => {
    fetchJobPosts();
  }, []);

  const fetchJobPosts = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'jobs',
        [Query.orderDesc('createdAt')]
      );
      setJobPosts(response.documents as JobPost[]);
    } catch (error) {
      console.error('Error fetching job posts:', error);
      toast.error('Failed to fetch job posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.user) {
      toast.error('You must be logged in to create job posts');
      return;
    }

    if (!auth.checkIsAdmin()) {
      toast.error('You must be an admin to create job posts');
      return;
    }

    try {
      setLoading(true);
      const skillsArray = skills.split(',').map(skill => skill.trim()).filter(Boolean);
      const paymentNumber = parseFloat(payment);

      if (isNaN(paymentNumber)) {
        toast.error('Please enter a valid payment amount');
        return;
      }

      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'jobs',
        ID.unique(),
        {
          title,
          description,
          requiredSkills: skillsArray,
          payment: paymentNumber,
          createdAt: new Date().toISOString(),
        }
      );

      toast.success('Job post created successfully');
      setTitle('');
      setDescription('');
      setSkills('');
      setPayment('');
      fetchJobPosts();
    } catch (error) {
      console.error('Error creating job post:', error);
      toast.error('Failed to create job post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job post?')) {
      return;
    }

    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'jobs',
        jobId
      );
      toast.success('Job post deleted successfully');
      fetchJobPosts();
    } catch (error) {
      console.error('Error deleting job post:', error);
      toast.error('Failed to delete job post');
    }
  };

  if (!auth.user || !auth.checkIsAdmin()) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Access Denied
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            You must be an admin to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Create New Job Post
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Required Skills (comma-separated)
              </label>
              <input
                type="text"
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                required
                placeholder="React, TypeScript, Tailwind CSS"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="payment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Payment (EUR)
              </label>
              <input
                type="number"
                id="payment"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <FiPlus className="w-5 h-5 mr-2" />
              Create Job Post
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Existing Job Posts
          </h2>
          <div className="space-y-6">
            {jobPosts.map((job) => (
              <motion.div
                key={job.$id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {job.title}
                  </h3>
                  <button
                    onClick={() => handleDelete(job.$id)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {job.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.requiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  Payment: €{job.payment.toFixed(2)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 