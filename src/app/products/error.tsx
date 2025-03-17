'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FiAlertTriangle, FiRefreshCw, FiGithub } from 'react-icons/fi';

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Products page error:', error);
  }, [error]);

  return (
    <div className="container max-w-7xl py-12">
      <div className="flex flex-col items-center justify-center text-center py-16">
        <div className="inline-flex items-center justify-center p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full mb-6">
          <FiAlertTriangle className="h-8 w-8" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
        
        <p className="text-muted-foreground dark:text-gray-400 max-w-md mb-8">
          We encountered an error while trying to load our products. This might be due to a temporary issue with the GitHub API or network connectivity.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <FiRefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </button>
          
          <Link
            href="https://github.com/EonfluxTech-com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-card dark:bg-gray-800 border border-border dark:border-gray-700 text-foreground dark:text-gray-100 hover:bg-accent dark:hover:bg-gray-700 transition-colors"
          >
            <FiGithub className="mr-2 h-5 w-5" />
            Visit GitHub Directly
          </Link>
        </div>
      </div>
    </div>
  );
} 