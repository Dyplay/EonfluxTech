'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiHardDrive, FiActivity, FiDownload } from 'react-icons/fi';
import AdminGuard from '../components/AdminGuard';
import AdminNav from '../components/admin/AdminNav';
import StatCard from '../components/admin/StatCard';
import ChartCard from '../components/admin/ChartCard';
import UserProfileCard from '../components/admin/UserProfileCard';
import { 
  getAppwriteStats, 
  getUserCount, 
  getGumroadConnectionsCount, 
  getCurrentUserProfile,
  AppwriteStats, 
  UserProfile 
} from '@/lib/admin';
import { ChartOptions } from 'chart.js';

// Define consistent colors for charts
const chartColors = {
  blue: {
    border: 'rgb(14, 165, 233)',
    background: 'rgba(14, 165, 233, 0.5)',
  },
  purple: {
    border: 'rgb(99, 102, 241)',
    background: 'rgba(99, 102, 241, 0.5)',
    light: 'rgba(99, 102, 241, 0.2)',
    hover: 'rgba(99, 102, 241, 0.8)',
  },
  green: {
    border: 'rgb(34, 197, 94)',
    background: 'rgba(34, 197, 94, 0.5)',
  }
};

// Define consistent chart options
const chartOptions: ChartOptions<'line' | 'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        boxWidth: 12,
        usePointStyle: true,
        pointStyle: 'circle',
        color: 'rgb(99, 102, 241)',
        font: {
          weight: 'bold',
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 10,
      cornerRadius: 6,
      boxPadding: 4,
      usePointStyle: true,
      titleFont: {
        weight: 'bold',
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(99, 102, 241, 0.1)',
      },
      ticks: {
        precision: 0,
        color: 'rgba(99, 102, 241, 0.8)',
        font: {
          weight: 'bold',
        },
      },
      border: {
        color: 'rgba(99, 102, 241, 0.2)',
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: 'rgba(99, 102, 241, 0.8)',
        font: {
          weight: 'bold',
        },
      },
      border: {
        color: 'rgba(99, 102, 241, 0.2)',
      },
    },
  },
  elements: {
    line: {
      borderWidth: 2,
      tension: 0.4,
    },
    point: {
      radius: 4,
      hoverRadius: 6,
      backgroundColor: 'white',
      borderWidth: 2,
    },
    bar: {
      borderWidth: 1,
      borderRadius: 4,
    },
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AppwriteStats | null>(null);
  const [userCount, setUserCount] = useState<number>(0);
  const [gumroadConnections, setGumroadConnections] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingRealData, setUsingRealData] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all stats from a single API call
        console.log('Fetching stats data...');
        const statsData = await getAppwriteStats();
        
        // Check if we're using real data by looking at a property that would only be set by the API
        // The mock data will have a fixed user count of 25
        setUsingRealData(statsData.users.total !== 25);
        
        setStats(statsData);
        setUserCount(statsData.users.total);
        setGumroadConnections(statsData.gumroadConnections || 0);
        console.log('Stats data loaded successfully');
      } catch (err: any) {
        console.error('Error fetching admin data:', err);
        setError(err.message || 'Failed to load dashboard data');
        setUsingRealData(false);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserProfile = async () => {
      try {
        setProfileLoading(true);
        const profile = await getCurrentUserProfile();
        setUserProfile(profile);
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchData();
    fetchUserProfile();
  }, []);

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format bytes to human-readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Prepare chart data
  const getBandwidthChartData = () => {
    if (!stats) return null;
    
    return {
      labels: stats.bandwidth.labels,
      datasets: [
        {
          label: 'Bandwidth Usage (MB)',
          data: stats.bandwidth.usage,
          borderColor: chartColors.purple.border,
          backgroundColor: chartColors.purple.background,
          hoverBackgroundColor: chartColors.purple.hover,
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const getStorageChartData = () => {
    if (!stats) return null;
    
    return {
      labels: stats.storage.labels,
      datasets: [
        {
          label: 'Storage Usage (MB)',
          data: stats.storage.usage,
          borderColor: chartColors.purple.border,
          backgroundColor: chartColors.purple.background,
          hoverBackgroundColor: chartColors.purple.hover,
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const getRequestsChartData = () => {
    if (!stats) return null;
    
    return {
      labels: stats.requests.labels,
      datasets: [
        {
          label: 'API Requests',
          data: stats.requests.usage,
          backgroundColor: chartColors.purple.background,
          borderColor: chartColors.purple.border,
          hoverBackgroundColor: chartColors.purple.hover,
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  };

  const getUsersChartData = () => {
    if (!stats) return null;
    
    return {
      labels: stats.users.labels,
      datasets: [
        {
          label: 'User Growth',
          data: stats.users.growth,
          borderColor: chartColors.purple.border,
          backgroundColor: chartColors.purple.background,
          hoverBackgroundColor: chartColors.purple.hover,
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  return (
    <>
      <div className="container max-w-7xl py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground mb-8">
              Monitor your Appwrite project statistics and user data
            </p>
          </div>
          
          {!loading && usingRealData !== null && (
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              usingRealData 
                ? 'bg-green-500/10 text-green-500' 
                : 'bg-amber-500/10 text-amber-500'
            }`}>
              {usingRealData ? 'Using real data' : 'Using mock data'}
            </div>
          )}
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md"
          >
            <p>{error}</p>
            <p className="text-sm mt-2">
              Some data may be displayed from fallback values.
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <StatCard
                title="Total Users"
                value={loading ? '...' : formatNumber(userCount)}
                icon={<FiUsers className="h-6 w-6 text-purple-500" />}
                description="Registered accounts"
                color="primary"
              />
              <StatCard
                title="Gumroad Connections"
                value={loading ? '...' : formatNumber(gumroadConnections)}
                icon={<FiActivity className="h-6 w-6 text-purple-500" />}
                description="Connected Gumroad accounts"
                color="primary"
              />
              <StatCard
                title="Storage Used"
                value={loading ? '...' : `${formatNumber(stats?.storage.total || 0)} MB`}
                icon={<FiHardDrive className="h-6 w-6 text-purple-500" />}
                description="Total storage consumption"
                color="primary"
              />
              <StatCard
                title="Bandwidth Used"
                value={loading ? '...' : `${formatNumber(stats?.bandwidth.total || 0)} MB`}
                icon={<FiDownload className="h-6 w-6 text-purple-500" />}
                description="Total bandwidth consumption"
                color="primary"
              />
            </div>
          </div>
          
          <div className="lg:col-span-1">
            {/* User Profile */}
            <UserProfileCard 
              userProfile={userProfile} 
              loading={profileLoading} 
            />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard
            title="Bandwidth Usage"
            description="Daily bandwidth consumption in MB"
            chartType="line"
            data={getBandwidthChartData() || { labels: [], datasets: [] }}
            loading={loading}
            options={chartOptions}
            className="border-purple-200 hover:shadow-md hover:shadow-purple-100 transition-shadow"
          />
          <ChartCard
            title="API Requests"
            description="Daily API request count"
            chartType="bar"
            data={getRequestsChartData() || { labels: [], datasets: [] }}
            loading={loading}
            options={chartOptions}
            className="border-purple-200 hover:shadow-md hover:shadow-purple-100 transition-shadow"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Storage Usage"
            description="Daily storage consumption in MB"
            chartType="line"
            data={getStorageChartData() || { labels: [], datasets: [] }}
            loading={loading}
            options={chartOptions}
            className="border-purple-200 hover:shadow-md hover:shadow-purple-100 transition-shadow"
          />
          <ChartCard
            title="User Growth"
            description="Daily new user registrations"
            chartType="line"
            data={getUsersChartData() || { labels: [], datasets: [] }}
            loading={loading}
            options={chartOptions}
            className="border-purple-200 hover:shadow-md hover:shadow-purple-100 transition-shadow"
          />
        </div>
      </div>
    </>
  );
} 