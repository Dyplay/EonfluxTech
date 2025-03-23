'use client';

import { useState, useEffect } from 'react';
import { FiRefreshCw, FiSave, FiAlertCircle, FiCheck } from 'react-icons/fi';

interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  baseUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    twitter: string;
    facebook: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  features: {
    enableBlog: boolean;
    enableComments: boolean;
    enableDarkMode: boolean;
    enableAnalytics: boolean;
    enableNewsletter: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    ogImage: string;
  };
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'NextJS Foundation',
    tagline: 'Building the future with Next.js',
    description: 'A complete toolkit for building modern web applications with Next.js',
    baseUrl: 'https://nextjsfoundation.com',
    contactEmail: 'contact@nextjsfoundation.com',
    contactPhone: '+1 (555) 123-4567',
    address: '123 Web Developer St, San Francisco, CA 94107',
    socialLinks: {
      twitter: 'https://twitter.com/nextjsfoundation',
      facebook: 'https://facebook.com/nextjsfoundation',
      instagram: 'https://instagram.com/nextjsfoundation',
      linkedin: 'https://linkedin.com/company/nextjsfoundation',
      youtube: 'https://youtube.com/c/nextjsfoundation'
    },
    features: {
      enableBlog: true,
      enableComments: true,
      enableDarkMode: true,
      enableAnalytics: false,
      enableNewsletter: true
    },
    seo: {
      metaTitle: 'NextJS Foundation | Building Modern Web Applications',
      metaDescription: 'NextJS Foundation provides tools, resources and guides for building high-performance web applications with Next.js',
      keywords: 'nextjs, react, web development, frontend, javascript, typescript',
      ogImage: '/images/og-image.jpg'
    },
    appearance: {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      fontFamily: 'Inter, sans-serif'
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real application, you would fetch settings from an API
      // For demonstration, we're using mock data
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to load settings');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      // In a real application, you would save settings to an API
      // For demonstration, we're just updating the local state
      setTimeout(() => {
        setSettings(formData);
        setSuccessMessage('Settings saved successfully!');
        setSaving(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }, 1000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    
    const { name, value } = e.target;
    
    // Handle nested objects (e.g., 'socialLinks.twitter')
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData({
        ...formData,
        [section]: {
          ...formData[section as keyof SiteSettings],
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    
    const { name, checked } = e.target;
    
    // Handle nested objects (e.g., 'features.enableBlog')
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData({
        ...formData,
        [section]: {
          ...formData[section as keyof SiteSettings],
          [field]: checked
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: checked
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <p className="ml-3 text-gray-600 dark:text-gray-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Site Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your site configuration and preferences
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? <FiRefreshCw className="mr-2 animate-spin" /> : <FiSave className="mr-2" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-3 rounded relative" role="alert">
          <div className="flex">
            <FiAlertCircle className="h-5 w-5 mr-2" />
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 px-4 py-3 rounded relative" role="alert">
          <div className="flex">
            <FiCheck className="h-5 w-5 mr-2" />
            <span className="block sm:inline">{successMessage}</span>
          </div>
        </div>
      )}

      {formData && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 space-y-8">
            {/* General Settings */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">General Settings</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Site Name
                  </label>
                  <input
                    type="text"
                    name="siteName"
                    id="siteName"
                    value={formData.siteName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tagline
                  </label>
                  <input
                    type="text"
                    name="tagline"
                    id="tagline"
                    value={formData.tagline}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Site Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Base URL
                  </label>
                  <input
                    type="url"
                    name="baseUrl"
                    id="baseUrl"
                    value={formData.baseUrl}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  />
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">SEO Settings</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="seo.metaTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="seo.metaTitle"
                    id="seo.metaTitle"
                    value={formData.seo.metaTitle}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="seo.metaDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Meta Description
                  </label>
                  <textarea
                    name="seo.metaDescription"
                    id="seo.metaDescription"
                    rows={3}
                    value={formData.seo.metaDescription}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="seo.keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    name="seo.keywords"
                    id="seo.keywords"
                    value={formData.seo.keywords}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="seo.ogImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    OG Image URL
                  </label>
                  <input
                    type="url"
                    name="seo.ogImage"
                    id="seo.ogImage"
                    value={formData.seo.ogImage}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    id="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address
                  </label>
                  <textarea
                    name="address"
                    id="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Social Media Links</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="socialLinks.twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    name="socialLinks.twitter"
                    id="socialLinks.twitter"
                    value={formData.socialLinks.twitter}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label htmlFor="socialLinks.facebook" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    name="socialLinks.facebook"
                    id="socialLinks.facebook"
                    value={formData.socialLinks.facebook}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label htmlFor="socialLinks.instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    name="socialLinks.instagram"
                    id="socialLinks.instagram"
                    value={formData.socialLinks.instagram}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label htmlFor="socialLinks.linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="socialLinks.linkedin"
                    id="socialLinks.linkedin"
                    value={formData.socialLinks.linkedin}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label htmlFor="socialLinks.youtube" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    name="socialLinks.youtube"
                    id="socialLinks.youtube"
                    value={formData.socialLinks.youtube}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  />
                </div>
              </div>
            </div>

            {/* Feature Toggles */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Feature Toggles</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="features.enableBlog"
                      name="features.enableBlog"
                      type="checkbox"
                      checked={formData.features.enableBlog}
                      onChange={handleCheckboxChange}
                      className="focus:ring-blue-500 dark:focus:ring-blue-400 h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="features.enableBlog" className="font-medium text-gray-700 dark:text-gray-300">
                      Enable Blog
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">Show the blog section on your site</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="features.enableComments"
                      name="features.enableComments"
                      type="checkbox"
                      checked={formData.features.enableComments}
                      onChange={handleCheckboxChange}
                      className="focus:ring-blue-500 dark:focus:ring-blue-400 h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="features.enableComments" className="font-medium text-gray-700 dark:text-gray-300">
                      Enable Comments
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">Allow users to comment on blog posts</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="features.enableDarkMode"
                      name="features.enableDarkMode"
                      type="checkbox"
                      checked={formData.features.enableDarkMode}
                      onChange={handleCheckboxChange}
                      className="focus:ring-blue-500 dark:focus:ring-blue-400 h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="features.enableDarkMode" className="font-medium text-gray-700 dark:text-gray-300">
                      Enable Dark Mode
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">Allow users to switch between light and dark themes</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="features.enableAnalytics"
                      name="features.enableAnalytics"
                      type="checkbox"
                      checked={formData.features.enableAnalytics}
                      onChange={handleCheckboxChange}
                      className="focus:ring-blue-500 dark:focus:ring-blue-400 h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="features.enableAnalytics" className="font-medium text-gray-700 dark:text-gray-300">
                      Enable Analytics
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">Track user behavior and page views</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="features.enableNewsletter"
                      name="features.enableNewsletter"
                      type="checkbox"
                      checked={formData.features.enableNewsletter}
                      onChange={handleCheckboxChange}
                      className="focus:ring-blue-500 dark:focus:ring-blue-400 h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="features.enableNewsletter" className="font-medium text-gray-700 dark:text-gray-300">
                      Enable Newsletter
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">Show newsletter signup form</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 