'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiChevronDown } from 'react-icons/fi';
import RepoCard from './RepoCard';
import { GitHubRepo } from '@/lib/github';

interface RepoGridProps {
  repos: GitHubRepo[];
}

type SortOption = 'updated' | 'stars' | 'forks' | 'name';

export default function RepoGrid({ repos }: RepoGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>(repos);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  
  // Get unique languages from repos
  const languages = Array.from(new Set(repos.filter(repo => repo.language).map(repo => repo.language))) as string[];
  
  // Filter and sort repos when dependencies change
  useEffect(() => {
    let result = [...repos];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(repo => 
        repo.name.toLowerCase().includes(term) || 
        (repo.description && repo.description.toLowerCase().includes(term)) ||
        (repo.topics && repo.topics.some(topic => topic.toLowerCase().includes(term)))
      );
    }
    
    // Filter by language
    if (selectedLanguage) {
      result = result.filter(repo => repo.language === selectedLanguage);
    }
    
    // Sort repos
    result.sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return b.stargazers_count - a.stargazers_count;
        case 'forks':
          return b.forks_count - a.forks_count;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });
    
    setFilteredRepos(result);
  }, [repos, searchTerm, sortBy, selectedLanguage]);
  
  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-grow">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border dark:border-gray-700 rounded-md bg-background dark:bg-gray-800 text-foreground dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        {/* Filter and sort options */}
        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center px-4 py-2 border border-border dark:border-gray-700 rounded-md bg-background dark:bg-gray-800 text-foreground dark:text-gray-100 hover:bg-accent dark:hover:bg-gray-700 transition-colors"
            >
              <FiFilter className="mr-2 h-4 w-4" />
              <span>Filter</span>
              <FiChevronDown className={`ml-2 h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card dark:bg-gray-800 border border-border dark:border-gray-700 z-10"
              >
                <div className="py-1">
                  <button
                    onClick={() => setSelectedLanguage(null)}
                    className={`block w-full text-left px-4 py-2 text-sm ${!selectedLanguage ? 'text-primary dark:text-primary-foreground' : 'text-foreground dark:text-gray-100'} hover:bg-accent dark:hover:bg-gray-700 transition-colors`}
                  >
                    All Languages
                  </button>
                  
                  {languages.map(language => (
                    <button
                      key={language}
                      onClick={() => setSelectedLanguage(language)}
                      className={`block w-full text-left px-4 py-2 text-sm ${selectedLanguage === language ? 'text-primary dark:text-primary-foreground' : 'text-foreground dark:text-gray-100'} hover:bg-accent dark:hover:bg-gray-700 transition-colors`}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 border border-border dark:border-gray-700 rounded-md bg-background dark:bg-gray-800 text-foreground dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="updated">Recently Updated</option>
            <option value="stars">Most Stars</option>
            <option value="forks">Most Forks</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
      
      {filteredRepos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground dark:text-gray-400 text-lg">
            No repositories found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepos.map((repo, index) => (
            <RepoCard key={repo.id} repo={repo} index={index} />
          ))}
        </div>
      )}
    </div>
  );
} 