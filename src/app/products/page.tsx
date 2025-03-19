'use client';

import { useState, useEffect } from 'react';
import { getGithubRepos, GitHubRepo } from '@/lib/github';
import { FiChevronDown, FiGithub, FiDownload, FiCode, FiStar, FiGitBranch } from 'react-icons/fi';
import { motion } from 'framer-motion';

type SortOption = 'recently_updated' | 'stars' | 'name';
type FilterOption = 'all' | 'source' | 'fork';

export default function ProductsPage() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterOption>('all');
  const [currentSort, setCurrentSort] = useState<SortOption>('recently_updated');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRepos = async () => {
      const data = await getGithubRepos();
      setRepos(data);
      setIsLoading(false);
    };
    fetchRepos();
  }, []);

  const filterOptions = {
    all: 'All',
    source: 'Source',
    fork: 'Forks'
  };

  const sortOptions = {
    recently_updated: 'Recently Updated',
    stars: 'Most Stars',
    name: 'Name'
  };

  const filteredAndSortedRepos = repos
    .filter(repo => {
      // Apply search filter
      const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (repo.topics || []).some((topic: string) => topic.toLowerCase().includes(searchQuery.toLowerCase()));

      // Apply type filter
      const matchesFilter = currentFilter === 'all' ? true :
        currentFilter === 'fork' ? repo.fork :
        currentFilter === 'source' ? !repo.fork : true;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (currentSort) {
        case 'recently_updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'stars':
          return b.stargazers_count - a.stargazers_count;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container py-12 flex flex-col items-center">
      <motion.div 
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-full bg-primary/20 p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 16.0002V8.00024C20.9996 7.6441 20.9071 7.29471 20.7315 6.99038C20.556 6.68604 20.3037 6.43793 20 6.27024L13 2.27024C12.696 2.10251 12.3511 2.01367 12 2.01367C11.6489 2.01367 11.304 2.10251 11 2.27024L4 6.27024C3.69626 6.43793 3.44398 6.68604 3.26846 6.99038C3.09294 7.29471 3.00036 7.6441 3 8.00024V16.0002C3.00036 16.3564 3.09294 16.7058 3.26846 17.0101C3.44398 17.3145 3.69626 17.5626 4 17.7302L11 21.7302C11.304 21.898 11.6489 21.9868 12 21.9868C12.3511 21.9868 12.696 21.898 13 21.7302L20 17.7302C20.3037 17.5626 20.556 17.3145 20.7315 17.0101C20.9071 16.7058 20.9996 16.3564 21 16.0002Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.27002 6.96021L12 12.0102L20.73 6.96021" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 22.0002V12.0002" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Our Products</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Explore our open-source projects and products. These repositories showcase our commitment to innovation and quality software development.
        </p>
      </motion.div>

      <motion.a 
        href="https://github.com/EonfluxTech-com"
        target="_blank"
        rel="noopener noreferrer"
        className="mb-12 inline-flex items-center px-6 py-3 bg-primary rounded-lg text-white hover:bg-primary/90 transition-colors"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiGithub className="w-5 h-5 mr-2" />
        Visit Our GitHub Organization
      </motion.a>

      <div className="w-full max-w-7xl">
        <motion.div 
          className="flex gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="relative">
            <button 
              onClick={() => {
                setShowFilterMenu(!showFilterMenu);
                setShowSortMenu(false);
              }}
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white hover:bg-gray-700/50 transition-colors flex items-center gap-2"
            >
              {filterOptions[currentFilter]}
              <FiChevronDown className={`transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
            </button>
            {showFilterMenu && (
              <motion.div 
                className="absolute top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {Object.entries(filterOptions).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setCurrentFilter(value as FilterOption);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-700/50 text-white ${
                      currentFilter === value ? 'bg-gray-700/50' : ''
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <div className="relative">
            <button 
              onClick={() => {
                setShowSortMenu(!showSortMenu);
                setShowFilterMenu(false);
              }}
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white hover:bg-gray-700/50 transition-colors flex items-center gap-2"
            >
              {sortOptions[currentSort]}
              <FiChevronDown className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
            </button>
            {showSortMenu && (
              <motion.div 
                className="absolute top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {Object.entries(sortOptions).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setCurrentSort(value as SortOption);
                      setShowSortMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-700/50 text-white ${
                      currentSort === value ? 'bg-gray-700/50' : ''
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <motion.div 
            className="grid gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {filteredAndSortedRepos.map((repo) => (
              <motion.div 
                key={repo.id} 
                className="p-6 bg-gray-800/30 border border-gray-700 rounded-lg hover:border-primary/50 transition-colors"
                variants={item}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-white">{repo.name}</h2>
                  <div className="flex items-center gap-3 text-gray-400">
                    <span className="flex items-center gap-1">
                      <FiStar className="w-4 h-4" />
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiGitBranch className="w-4 h-4" />
                      {repo.forks_count || 0}
                    </span>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">{repo.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {repo.topics?.map((topic) => (
                    <span key={topic} className="px-2 py-1 text-sm bg-primary/20 text-primary rounded">
                      {topic}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <a 
                      href={repo.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline flex items-center gap-2"
                    >
                      <FiCode className="w-4 h-4" />
                      View Code
                    </a>
                    <a 
                      href={`${repo.html_url}/archive/refs/heads/main.zip`} 
                      className="text-primary hover:underline flex items-center gap-2"
                    >
                      <FiDownload className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                  {repo.language && (
                    <span className="text-sm text-gray-400">
                      {repo.language}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
} 