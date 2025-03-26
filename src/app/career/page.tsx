'use client';

import { useState, useEffect } from 'react';
import { databases } from '@/lib/appwrite';
import { Query, Models } from 'appwrite';
import JobCard from './components/JobCard';

interface JobPost extends Models.Document {
  title: string;
  description: string;
  requiredSkills: string;
  payment: number;
  createdAt: string;
}

export default function CareerPage() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'jobs',
          [
            Query.orderDesc('$createdAt'),
          ]
        );
        setJobs(response.documents as JobPost[]);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Open Positions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Join our team and help build amazing products
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">
              No open positions at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <JobCard key={job.$id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 