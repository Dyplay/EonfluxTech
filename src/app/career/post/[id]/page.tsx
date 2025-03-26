'use client';

import { useState, useEffect } from 'react';
import { databases } from '@/lib/appwrite';
import { Query, Models } from 'appwrite';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiSend, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'sonner';
import Link from 'next/link';

interface JobPost extends Models.Document {
  title: string;
  description: string;
  requiredSkills: string;
  payment: number;
  createdAt: string;
}

interface ApplicationFormData {
  name: string;
  email: string;
  age: string;
  portfolio: string;
  experience: string;
  coverLetter: string;
}

export default function JobPostPage({ params }: { params: { id: string } }) {
  const [jobPost, setJobPost] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: '',
    email: '',
    age: '',
    portfolio: '',
    experience: '',
    coverLetter: ''
  });

  // Helper function to convert skills string to array
  const getSkillsArray = (skillsString: string) => {
    return skillsString.split(',').map(skill => skill.trim()).filter(Boolean);
  };

  useEffect(() => {
    const fetchJobPost = async () => {
      try {
        const response = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'jobs',
          params.id
        );
        setJobPost(response as JobPost);
      } catch (error) {
        console.error('Error fetching job post:', error);
        toast.error('Failed to load job post');
      } finally {
        setLoading(false);
      }
    };

    fetchJobPost();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate age
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 15) {
      toast.error('You must be 15 or older to apply');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/career/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: params.id,
          jobTitle: jobPost?.title,
          ...formData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!jobPost) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Job Post Not Found
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            The job post you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/career"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {jobPost.title}
          </h1>
          
          <div className="prose dark:prose-invert max-w-none mb-8">
            <p className="text-gray-600 dark:text-gray-300">
              {jobPost.description}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Required Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {getSkillsArray(jobPost.requiredSkills).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Payment
            </h2>
            <p className="text-2xl font-bold text-primary">
              €{jobPost.payment.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Payment will be made in EUR. Currency conversion fees may apply.
            </p>
          </div>

          <AnimatePresence>
            {!submitted ? (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Apply for this Position
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Age
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="number"
                      id="age"
                      name="age"
                      required
                      min="15"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="18"
                    />
                  </div>

                  <div>
                    <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Portfolio URL
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="url"
                      id="portfolio"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="https://your-portfolio.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Relevant Experience
                  </label>
                  <motion.textarea
                    whileFocus={{ scale: 1.01 }}
                    id="experience"
                    name="experience"
                    required
                    rows={3}
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Describe your relevant experience..."
                  />
                </div>

                <div>
                  <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cover Letter
                  </label>
                  <motion.textarea
                    whileFocus={{ scale: 1.01 }}
                    id="coverLetter"
                    name="coverLetter"
                    required
                    rows={5}
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Why are you interested in this position?"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {submitting ? (
                    <motion.div
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <>
                      <FiSend className="w-5 h-5 mr-2" />
                      Submit Application
                    </>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <FiCheck className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Application Submitted!
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Thank you for your application. We'll review it and get back to you soon.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 