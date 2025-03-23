'use client';

import { useState, useEffect } from 'react';
import { 
  FiActivity, 
  FiUsers, 
  FiFileText, 
  FiRefreshCw, 
  FiArrowUp, 
  FiArrowDown, 
  FiDatabase, 
  FiEye, 
  FiClock, 
  FiHardDrive, 
  FiWifi
} from 'react-icons/fi';
import { useAuth } from '@/lib/auth/AuthProvider';

interface UsageStats {
  totalRequests: number;
  realtimeConnections: number;
  documentsCount: number;
  storageSize: string;
  bandwidthUsed: string;
  executionTime: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

// StatCard component for displaying statistics
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  percentage,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'stable';
  percentage?: number;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}) {
  // Define color classes based on the color prop
  const colorClasses = {
    blue: {
      icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
      trend: {
        up: 'text-green-600 dark:text-green-400',
        down: 'text-red-600 dark:text-red-400',
        stable: 'text-gray-600 dark:text-gray-400',
      },
      border: 'border-blue-200 dark:border-blue-800/30'
    },
    green: {
      icon: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
      trend: {
        up: 'text-green-600 dark:text-green-400',
        down: 'text-red-600 dark:text-red-400',
        stable: 'text-gray-600 dark:text-gray-400',
      },
      border: 'border-green-200 dark:border-green-800/30'
    },
    yellow: {
      icon: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400',
      trend: {
        up: 'text-green-600 dark:text-green-400',
        down: 'text-red-600 dark:text-red-400',
        stable: 'text-gray-600 dark:text-gray-400',
      },
      border: 'border-yellow-200 dark:border-yellow-800/30'
    },
    red: {
      icon: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
      trend: {
        up: 'text-green-600 dark:text-green-400',
        down: 'text-red-600 dark:text-red-400',
        stable: 'text-gray-600 dark:text-gray-400',
      },
      border: 'border-red-200 dark:border-red-800/30'
    },
    purple: {
      icon: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
      trend: {
        up: 'text-green-600 dark:text-green-400',
        down: 'text-red-600 dark:text-red-400',
        stable: 'text-gray-600 dark:text-gray-400',
      },
      border: 'border-purple-200 dark:border-purple-800/30'
    },
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border ${colorClasses[color].border} overflow-hidden p-6 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color].icon} mr-5`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && percentage && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <FiArrowUp className={`mr-1 ${colorClasses[color].trend.up}`} />
              ) : trend === 'down' ? (
                <FiArrowDown className={`mr-1 ${colorClasses[color].trend.down}`} />
              ) : (
                <span className={`mr-1 ${colorClasses[color].trend.stable}`}>●</span>
              )}
              <span 
                className={`text-xs font-medium ${
                  trend === 'up' 
                    ? colorClasses[color].trend.up
                    : trend === 'down' 
                      ? colorClasses[color].trend.down 
                      : colorClasses[color].trend.stable
                }`}
              >
                {percentage}% {trend === 'up' ? 'increase' : trend === 'down' ? 'decrease' : 'no change'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PanelDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 2487,
    gumroadUsers: 842,
    totalPosts: 156,
    totalViews: 245689,
  });
  
  const [appwriteUsage, setAppwriteUsage] = useState<UsageStats>({
    totalRequests: 1248356,
    realtimeConnections: 345,
    documentsCount: 2856,
    storageSize: '1.2 GB',
    bandwidthUsed: '15.4 GB',
    executionTime: '326 ms',
    trend: 'up',
    percentage: 12,
  });

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulate refreshing data
      setStats({
        totalUsers: Math.floor(2400 + Math.random() * 200),
        gumroadUsers: Math.floor(800 + Math.random() * 100),
        totalPosts: Math.floor(150 + Math.random() * 20),
        totalViews: Math.floor(245000 + Math.random() * 1000),
      });
      
      setAppwriteUsage({
        totalRequests: Math.floor(1240000 + Math.random() * 20000),
        realtimeConnections: Math.floor(340 + Math.random() * 20),
        documentsCount: Math.floor(2800 + Math.random() * 100),
        storageSize: '1.2 GB',
        bandwidthUsed: '15.4 GB',
        executionTime: `${320 + Math.floor(Math.random() * 20)} ms`,
        trend: 'up',
        percentage: Math.floor(10 + Math.random() * 5),
      });
      
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    // Initial data fetch 
    refreshData();
  }, []);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Overview of your application's usage and statistics.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={refreshData}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto disabled:opacity-50 transition-all duration-200"
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* General stats */}
      <div className="mb-10">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-5">General Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Registered Users"
            value={stats.totalUsers.toLocaleString()}
            icon={FiUsers}
            trend="up"
            percentage={12}
            color="blue"
          />
          <StatCard
            title="Gumroad Connected Users"
            value={stats.gumroadUsers.toLocaleString()}
            icon={FiUsers}
            trend="up"
            percentage={8}
            color="green"
          />
          <StatCard
            title="Blog Posts"
            value={stats.totalPosts.toLocaleString()}
            icon={FiFileText}
            trend="up"
            percentage={5}
            color="yellow"
          />
          <StatCard
            title="Total Views"
            value={stats.totalViews.toLocaleString()}
            icon={FiEye}
            trend="up"
            percentage={15}
            color="purple"
          />
        </div>
      </div>

      {/* Appwrite usage stats */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-5">Appwrite Usage Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total API Requests"
            value={appwriteUsage.totalRequests.toLocaleString()}
            icon={FiActivity}
            trend="up"
            percentage={appwriteUsage.percentage}
            color="blue"
          />
          <StatCard
            title="Realtime Connections"
            value={appwriteUsage.realtimeConnections}
            icon={FiWifi}
            trend="stable"
            percentage={2}
            color="green"
          />
          <StatCard
            title="Documents Count"
            value={appwriteUsage.documentsCount.toLocaleString()}
            icon={FiDatabase}
            trend="up"
            percentage={8}
            color="purple"
          />
          <StatCard
            title="Storage Size"
            value={appwriteUsage.storageSize}
            icon={FiHardDrive}
            trend="up"
            percentage={6}
            color="yellow"
          />
          <StatCard
            title="Bandwidth Used"
            value={appwriteUsage.bandwidthUsed}
            icon={FiActivity}
            trend="up"
            percentage={9}
            color="red"
          />
          <StatCard
            title="Avg. Execution Time"
            value={appwriteUsage.executionTime}
            icon={FiClock}
            trend="down"
            percentage={3}
            color="green"
          />
        </div>
      </div>
    </div>
  );
} 