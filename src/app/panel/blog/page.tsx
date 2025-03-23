'use client';

import { useState, useEffect } from 'react';
import { FiRefreshCw, FiEdit, FiEye, FiPlus, FiBarChart2, FiFileText, FiAward, FiClock, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import Link from 'next/link';

interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  drafts: number;
  totalViews: number;
}

interface Post {
  id: string;
  title: string;
  excerpt: string;
  status: 'published' | 'draft';
  publishedAt: string | null;
  views: number;
  comments: number;
  author: {
    name: string;
  };
}

interface Activity {
  id: string;
  action: 'edited' | 'created' | 'published' | 'commented';
  postTitle: string;
  postId: string;
  user: {
    name: string;
  };
  timestamp: string;
}

export default function BlogPage() {
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data
  const mockStats: BlogStats = {
    totalPosts: 24,
    publishedPosts: 18,
    drafts: 6,
    totalViews: 12458
  };

  const mockRecentPosts: Post[] = [
    {
      id: '1',
      title: 'Getting Started with Next.js',
      excerpt: 'Learn how to build modern web applications with Next.js',
      status: 'published',
      publishedAt: '2023-03-15T10:00:00Z',
      views: 1240,
      comments: 8,
      author: { name: 'John Doe' }
    },
    {
      id: '2',
      title: 'The Power of Server Components',
      excerpt: 'Exploring the benefits of React Server Components',
      status: 'published',
      publishedAt: '2023-03-10T14:30:00Z',
      views: 980,
      comments: 5,
      author: { name: 'Jane Smith' }
    },
    {
      id: '3',
      title: 'Building a Custom Admin Dashboard',
      excerpt: 'Step by step guide to creating your own admin panel',
      status: 'draft',
      publishedAt: null,
      views: 0,
      comments: 0,
      author: { name: 'John Doe' }
    }
  ];

  const mockPopularPosts: Post[] = [
    {
      id: '4',
      title: 'Optimizing React Applications',
      excerpt: 'Learn how to make your React apps faster and more efficient',
      status: 'published',
      publishedAt: '2023-02-20T09:15:00Z',
      views: 3240,
      comments: 24,
      author: { name: 'John Doe' }
    },
    {
      id: '5',
      title: 'Modern CSS Techniques',
      excerpt: 'Exploring the latest CSS features and best practices',
      status: 'published',
      publishedAt: '2023-02-15T11:45:00Z',
      views: 2850,
      comments: 18,
      author: { name: 'Jane Smith' }
    }
  ];

  const mockActivity: Activity[] = [
    {
      id: '1',
      action: 'edited',
      postTitle: 'Getting Started with Next.js',
      postId: '1',
      user: { name: 'John Doe' },
      timestamp: '2023-03-16T15:45:00Z'
    },
    {
      id: '2',
      action: 'created',
      postTitle: 'Building a Custom Admin Dashboard',
      postId: '3',
      user: { name: 'John Doe' },
      timestamp: '2023-03-15T10:30:00Z'
    },
    {
      id: '3',
      action: 'published',
      postTitle: 'The Power of Server Components',
      postId: '2',
      user: { name: 'Jane Smith' },
      timestamp: '2023-03-10T14:30:00Z'
    },
    {
      id: '4',
      action: 'commented',
      postTitle: 'Optimizing React Applications',
      postId: '4',
      user: { name: 'Sarah Williams' },
      timestamp: '2023-03-05T09:15:00Z'
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real application, you would fetch data from an API
      // For demonstration, we're using mock data
      setTimeout(() => {
        setStats(mockStats);
        setRecentPosts(mockRecentPosts);
        setPopularPosts(mockPopularPosts);
        setActivity(mockActivity);
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      console.error('Error fetching blog data:', err);
      setError(err.message || 'Failed to load blog data');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getActionIcon = (action: Activity['action']) => {
    switch (action) {
      case 'edited': return <FiEdit className="text-blue-500 dark:text-blue-400" />;
      case 'created': return <FiPlus className="text-green-500 dark:text-green-400" />;
      case 'published': return <FiEye className="text-purple-500 dark:text-purple-400" />;
      case 'commented': return <FiMessageSquare className="text-yellow-500 dark:text-yellow-400" />;
      default: return <FiEdit className="text-gray-500 dark:text-gray-400" />;
    }
  };

  const getActionText = (action: Activity['action']) => {
    switch (action) {
      case 'edited': return 'edited';
      case 'created': return 'created';
      case 'published': return 'published';
      case 'commented': return 'commented on';
      default: return 'modified';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage posts, monitor performance, and track activity
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link href="/panel/blog/new" className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <FiPlus className="mr-2" />
            New Post
          </Link>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          ))
        ) : stats && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Posts</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalPosts}</h3>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FiFileText className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                <span className="font-medium">+8%</span> from last month
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Published</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.publishedPosts}</h3>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FiEye className="text-green-600 dark:text-green-400" size={20} />
                </div>
              </div>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                <span className="font-medium">+12%</span> from last month
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Drafts</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.drafts}</h3>
                </div>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <FiClock className="text-yellow-600 dark:text-yellow-400" size={20} />
                </div>
              </div>
              <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                <span className="font-medium">-25%</span> from last month
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalViews.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FiBarChart2 className="text-purple-600 dark:text-purple-400" size={20} />
                </div>
              </div>
              <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                <span className="font-medium">+15%</span> from last month
              </div>
            </div>
          </>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Posts</h2>
            <Link href="/panel/blog/manage" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View all
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="border-b border-gray-200 dark:border-gray-700 pb-4 animate-pulse">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentPosts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-4">No posts found.</p>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentPosts.map(post => (
                <div key={post.id} className="py-3">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {post.title}
                    </h3>
                    <div className="flex space-x-2">
                      <Link href={`/panel/blog/edit/${post.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                        <FiEdit size={16} />
                      </Link>
                      <Link href={`/blog/${post.id}`} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300">
                        <FiEye size={16} />
                      </Link>
                    </div>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <span className={`text-xs inline-flex items-center ${
                      post.status === 'published' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      <span className={`mr-1.5 h-2 w-2 rounded-full ${
                        post.status === 'published' 
                          ? 'bg-green-500 dark:bg-green-400' 
                          : 'bg-yellow-500 dark:bg-yellow-400'
                      }`}></span>
                      {post.status}
                      {post.publishedAt && <span className="text-gray-500 dark:text-gray-400 ml-2">• {formatDate(post.publishedAt)}</span>}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {post.views} views
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          
          {loading ? (
            <div className="space-y-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : activity.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-4">No recent activity.</p>
          ) : (
            <div className="space-y-4">
              {activity.map(item => (
                <div key={item.id} className="flex">
                  <div className="mt-0.5 mr-3">
                    {getActionIcon(item.action)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">{item.user.name}</span>{' '}
                      {getActionText(item.action)}{' '}
                      <Link href={`/panel/blog/edit/${item.postId}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {item.postTitle}
                      </Link>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(item.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Posts */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Popular Posts</h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Last 30 days
            </button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array(2).fill(0).map((_, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : popularPosts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-4">No popular posts found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularPosts.map(post => (
                <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{post.title}</h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{post.excerpt}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="flex space-x-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <FiEye className="mr-1" size={14} />
                        {post.views.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <FiMessageSquare className="mr-1" size={14} />
                        {post.comments}
                      </span>
                    </div>
                    <Link href={`/panel/blog/edit/${post.id}`} className="text-blue-600 dark:text-blue-400 text-xs">
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}