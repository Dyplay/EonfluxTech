'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiStar, FiGitBranch, FiExternalLink, FiCode, FiCalendar } from 'react-icons/fi';
import { GitHubRepo } from '@/lib/github';

interface RepoCardProps {
  repo: GitHubRepo;
  index: number;
}

export default function RepoCard({ repo, index }: RepoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get language color
  const getLanguageColor = (language: string | null) => {
    if (!language) return 'bg-gray-400';
    
    const colors: Record<string, string> = {
      JavaScript: 'bg-yellow-400',
      TypeScript: 'bg-blue-500',
      Python: 'bg-green-500',
      Java: 'bg-red-500',
      'C#': 'bg-purple-500',
      PHP: 'bg-indigo-500',
      HTML: 'bg-orange-500',
      CSS: 'bg-pink-500',
      Ruby: 'bg-red-600',
      Go: 'bg-blue-400',
      Rust: 'bg-orange-600',
      Swift: 'bg-orange-500',
      Kotlin: 'bg-purple-400',
      Dart: 'bg-blue-300',
      Shell: 'bg-green-600',
    };
    
    return colors[language] || 'bg-gray-400';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-card dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-foreground dark:text-gray-100 truncate">
            {repo.name}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground dark:text-gray-400">
            <div className="flex items-center">
              <FiStar className="mr-1 h-4 w-4" />
              <span>{repo.stargazers_count}</span>
            </div>
            <div className="flex items-center">
              <FiGitBranch className="mr-1 h-4 w-4" />
              <span>{repo.forks_count}</span>
            </div>
          </div>
        </div>
        
        <p className="text-muted-foreground dark:text-gray-300 text-sm mb-4 line-clamp-2 h-10">
          {repo.description || 'No description provided'}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {repo.topics && repo.topics.slice(0, 3).map((topic) => (
            <span 
              key={topic} 
              className="px-2 py-1 text-xs rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground"
            >
              {topic}
            </span>
          ))}
          {repo.topics && repo.topics.length > 3 && (
            <span className="px-2 py-1 text-xs rounded-full bg-muted dark:bg-gray-700 text-muted-foreground dark:text-gray-400">
              +{repo.topics.length - 3} more
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center text-xs text-muted-foreground dark:text-gray-400">
          <div className="flex items-center">
            <FiCalendar className="mr-1 h-3 w-3" />
            <span>Updated {formatDate(repo.updated_at)}</span>
          </div>
          
          {repo.language && (
            <div className="flex items-center">
              <span className={`h-3 w-3 rounded-full mr-1 ${getLanguageColor(repo.language)}`}></span>
              <span>{repo.language}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-muted/50 dark:bg-gray-700/50 p-4 flex justify-between">
        <Link 
          href={repo.html_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <FiCode className="mr-1 h-4 w-4" />
          View Code
        </Link>
        
        {repo.homepage && (
          <Link 
            href={repo.homepage} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <FiExternalLink className="mr-1 h-4 w-4" />
            Live Demo
          </Link>
        )}
      </div>
    </motion.div>
  );
} 