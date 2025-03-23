'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FiEdit, 
  FiTrash2, 
  FiSearch,
  FiFilter,
  FiPlus,
  FiAlertCircle,
  FiChevronDown,
  FiEye,
  FiMoreHorizontal,
  FiX,
  FiRefreshCw
} from 'react-icons/fi';

interface Post {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'archived';
  author: string;
  category: string;
  publishedAt: string | null;
  updatedAt: string;
  views: number;
}

export default function BlogManagePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  
  // Add state for controlling dropdown visibility
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if click is outside of the dropdown
      if (!target.closest('#status-filter-button') && !target.closest('#status-dropdown')) {
        setStatusDropdownOpen(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mock data
  const mockPosts: Post[] = [
    {
      id: '1',
      title: 'Getting Started with Next.js 13',
      slug: 'getting-started-with-nextjs-13',
      status: 'published',
      author: 'Jane Smith',
      category: 'development',
      publishedAt: '2023-08-15T10:30:00Z',
      updatedAt: '2023-08-16T14:20:00Z',
      views: 1245
    },
    {
      id: '2',
      title: 'How to Implement Dark Mode in Your Website',
      slug: 'implement-dark-mode-website',
      status: 'published',
      author: 'John Doe',
      category: 'design',
      publishedAt: '2023-07-28T08:15:00Z',
      updatedAt: '2023-07-30T11:45:00Z',
      views: 982
    },
    {
      id: '3',
      title: 'Advanced React Hooks Patterns',
      slug: 'advanced-react-hooks-patterns',
      status: 'draft',
      author: 'Jane Smith',
      category: 'development',
      publishedAt: null,
      updatedAt: '2023-08-10T15:30:00Z',
      views: 0
    },
    {
      id: '4',
      title: 'Building a Responsive Dashboard with Tailwind CSS',
      slug: 'building-responsive-dashboard-tailwind',
      status: 'published',
      author: 'David Wilson',
      category: 'design',
      publishedAt: '2023-06-12T09:20:00Z',
      updatedAt: '2023-06-15T16:10:00Z',
      views: 2435
    },
    {
      id: '5',
      title: 'Performance Optimization Techniques for React Applications',
      slug: 'performance-optimization-react-apps',
      status: 'draft',
      author: 'Sarah Johnson',
      category: 'development',
      publishedAt: null,
      updatedAt: '2023-08-01T13:45:00Z',
      views: 0
    },
    {
      id: '6',
      title: 'Introduction to Server Components in Next.js',
      slug: 'intro-server-components-nextjs',
      status: 'archived',
      author: 'John Doe',
      category: 'development',
      publishedAt: '2022-11-05T11:20:00Z',
      updatedAt: '2023-07-20T10:15:00Z',
      views: 567
    },
    {
      id: '7',
      title: 'How to Create a Design System for Your Web Projects',
      slug: 'create-design-system-web-projects',
      status: 'published',
      author: 'Emma Thompson',
      category: 'design',
      publishedAt: '2023-07-14T14:30:00Z',
      updatedAt: '2023-07-16T09:25:00Z',
      views: 1876
    }
  ];

  // Fetch posts
  const fetchPosts = () => {
    setLoading(true);
    setError(null);
    
    // Simulate API delay
    setTimeout(() => {
      try {
        setPosts(mockPosts);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again.');
        setLoading(false);
      }
    }, 1000);
  };
  
  // Initial fetch
  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle post deletion
  const handleDeletePost = (id: string) => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      console.log('Deleting post:', id);
      // In a real application, you would call an API here
      setPosts(posts.filter(post => post.id !== id));
    }
  };

  // Filter posts based on search term and status
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter.includes(post.status);
    return matchesSearch && matchesStatus;
  });

  // Format date string
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not published';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get badge class based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/30';
      case 'draft':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/30';
      case 'archived':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/30';
    }
  };

  // Toggle status filter
  const toggleStatusFilter = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Posts</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your blog content
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button
            onClick={fetchPosts}
            disabled={loading}
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link 
            href="/panel/blog/new" 
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 rounded-md border border-transparent hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
          >
            <FiPlus className="mr-2" />
            New Post
          </Link>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-5 py-4 rounded-md shadow-sm relative" role="alert">
          <div className="flex">
            <span className="block sm:inline">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto pl-3"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm transition-all duration-200"
              placeholder="Search posts by title, author, or category"
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchTerm('')}
              >
                <FiX className="h-4 w-4 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400" />
              </button>
            )}
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <FiFilter className="mr-2 h-4 w-4" />
              Status:
            </span>
            
            <div className="flex flex-wrap gap-2">
              {['published', 'draft', 'archived'].map((status) => (
                <button
                  key={status}
                  onClick={() => toggleStatusFilter(status)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-200 ${
                    statusFilter.includes(status)
                      ? getStatusBadgeClass(status)
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
              
              {(searchTerm || statusFilter.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <FiX className="mr-1" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Posts Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="min-h-[200px] flex items-center justify-center p-6 text-center">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No posts found</p>
              <p className="text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Author
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Published
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Views
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {post.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(post.status)}`}>
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {post.author}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(post.publishedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {post.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/panel/blog/edit/${post.id}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                        >
                          <FiEdit className="h-5 w-5" />
                          <span className="sr-only">Edit</span>
                        </Link>
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors duration-200"
                        >
                          <FiEye className="h-5 w-5" />
                          <span className="sr-only">View</span>
                        </a>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200"
                        >
                          <FiTrash2 className="h-5 w-5" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Post count */}
        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium text-gray-700 dark:text-gray-300">{filteredPosts.length}</span> of <span className="font-medium text-gray-700 dark:text-gray-300">{posts.length}</span> posts
          </p>
        </div>
      </div>
    </div>
  );
} 