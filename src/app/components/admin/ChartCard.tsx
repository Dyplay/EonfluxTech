'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartCardProps {
  title: string;
  description?: string;
  chartType: 'line' | 'bar';
  data: ChartData<'line' | 'bar'>;
  options?: ChartOptions<'line' | 'bar'>;
  loading?: boolean;
  height?: number;
  className?: string;
}

export default function ChartCard({
  title,
  description,
  chartType,
  data,
  options,
  loading = false,
  height = 300,
  className = '',
}: ChartCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const defaultOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(160, 160, 160, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-card rounded-lg border border-border p-6 shadow-sm ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <div style={{ height: `${height}px`, position: 'relative' }}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : mounted ? (
          chartType === 'line' ? (
            <Line 
              data={data as ChartData<'line'>} 
              options={mergedOptions as ChartOptions<'line'>} 
            />
          ) : (
            <Bar 
              data={data as ChartData<'bar'>} 
              options={mergedOptions as ChartOptions<'bar'>} 
            />
          )
        ) : null}
      </div>
    </motion.div>
  );
} 