'use client';

import { useState } from 'react';
import { 
  FiArrowLeft, 
  FiEye, 
  FiEdit2, 
  FiSave, 
  FiCheck, 
  FiAlertCircle, 
  FiCalendar,
  FiTag
} from 'react-icons/fi';
import Link from 'next/link';

interface FormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  status: 'published' | 'draft';
  author: string;
  publishDate: string;
  tags: string[];
}

export default function NewPostPage() {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: 'general',
    status: 'draft',
    author: 'John Doe',
    publishDate: new Date().toISOString().split('T')[0],
    tags: [],
  });

  const categories = [
    'general', 'technology', 'design', 'business', 
    'marketing', 'development', 'tutorials', 'news'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Automatically generate slug from title if slug field is empty
    if (name === 'title' && !formData.slug) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Validate form data
      if (!formData.title.trim()) {
        throw new Error('Post title is required');
      }
      
      if (!formData.slug.trim()) {
        throw new Error('Post slug is required');
      }
      
      if (!formData.content.trim()) {
        throw new Error('Post content is required');
      }
      
      // Simulate API call
      setTimeout(() => {
        setSuccess('Post created successfully!');
        setSaving(false);
      }, 1500);
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Post</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create a new blog post
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Link 
            href="/panel/blog/manage" 
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
          >
            <FiArrowLeft className="mr-2" />
            Back to Posts
          </Link>
          <button
            type="button"
            onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
          >
            {mode === 'edit' ? (
              <>
                <FiEye className="mr-2" />
                Preview
              </>
            ) : (
              <>
                <FiEdit2 className="mr-2" />
                Edit
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-5 py-4 rounded-md shadow-sm relative" role="alert">
          <div className="flex">
            <FiAlertCircle className="h-5 w-5 mr-2" />
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 px-5 py-4 rounded-md shadow-sm relative" role="alert">
          <div className="flex">
            <FiCheck className="h-5 w-5 mr-2" />
            <span className="block sm:inline">{success}</span>
          </div>
        </div>
      )}

      {mode === 'preview' ? (
        // Preview Mode
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{formData.title || 'Untitled Post'}</h1>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30">
                {formData.category || 'General'}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                formData.status === 'published' 
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/30' 
                  : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/30'
              }`}>
                {formData.status}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                By: {formData.author}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                <FiCalendar className="mr-1" />
                {formData.publishDate}
              </span>
            </div>
            
            {formData.excerpt && (
              <div className="mb-6 text-lg italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg border border-gray-200 dark:border-gray-700/70">
                {formData.excerpt}
              </div>
            )}
            
            <div className="prose prose-blue max-w-none dark:prose-invert">
              {formData.content ? (
                <div className="whitespace-pre-wrap">{formData.content}</div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No content yet. Switch to edit mode to add content.</p>
              )}
            </div>
            
            {formData.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Edit Mode
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300">
          <div className="p-6 space-y-6">
            {/* Title and Slug */}
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Post Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 h-11 transition-all duration-200"
                  placeholder="Enter post title"
                />
              </div>
              
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 h-11 transition-all duration-200"
                  placeholder="enter-post-slug"
                />
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  The slug is used for the URL. It will be automatically generated from the title if left empty.
                </p>
              </div>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                id="content"
                rows={12}
                value={formData.content}
                onChange={handleInputChange}
                required
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 transition-all duration-200"
                placeholder="Write your post content here..."
              />
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Excerpt
              </label>
              <textarea
                name="excerpt"
                id="excerpt"
                rows={3}
                value={formData.excerpt}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 transition-all duration-200"
                placeholder="A brief summary of your post"
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                A short summary that appears in post listings and search results.
              </p>
            </div>

            {/* Category, Status, and Author */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  id="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 h-11 transition-all duration-200"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 h-11 transition-all duration-200"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  name="author"
                  id="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 h-11 transition-all duration-200"
                />
              </div>
            </div>

            {/* Publish Date and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Publication Date
                </label>
                <input
                  type="date"
                  name="publishDate"
                  id="publishDate"
                  value={formData.publishDate}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 h-11 transition-all duration-200"
                />
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={handleTagsChange}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 h-11 transition-all duration-200"
                  placeholder="tag1, tag2, tag3"
                />
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Separate multiple tags with commas.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center py-2.5 px-5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    Create Post
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
} 