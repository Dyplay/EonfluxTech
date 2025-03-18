'use client';

import { useState, useEffect } from 'react';
import { getGithubRepos } from '@/lib/github';
import { FiChevronDown } from 'react-icons/fi';

type SortOption = 'recently_updated' | 'stars' | 'name';
type FilterOption = 'all' | 'source' | 'fork';

export default function ProductsPage() {
  const [repos, setRepos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterOption>('all');
  const [currentSort, setCurrentSort] = useState<SortOption>('recently_updated');

  useEffect(() => {
    const fetchRepos = async () => {
      const data = await getGithubRepos();
      setRepos(data);
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
        (repo.topics || []).some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));

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

  return (
    <div className="container py-12 flex flex-col items-center">
      <div className="mb-8 text-center">
        <div className="rounded-full bg-primary/20 p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 16.0002V8.00024C20.9996 7.6441 20.9071 7.29471 20.7315 6.99038C20.556 6.68604 20.3037 6.43793 20 6.27024L13 2.27024C12.696 2.10251 12.3511 2.01367 12 2.01367C11.6489 2.01367 11.304 2.10251 11 2.27024L4 6.27024C3.69626 6.43793 3.44398 6.68604 3.26846 6.99038C3.09294 7.29471 3.00036 7.6441 3 8.00024V16.0002C3.00036 16.3564 3.09294 16.7058 3.26846 17.0101C3.44398 17.3145 3.69626 17.5626 4 17.7302L11 21.7302C11.304 21.898 11.6489 21.9868 12 21.9868C12.3511 21.9868 12.696 21.898 13 21.7302L20 17.7302C20.3037 17.5626 20.556 17.3145 20.7315 17.0101C20.9071 16.7058 20.9996 16.3564 21 16.0002Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.27002 6.96021L12 12.0102L20.73 6.96021" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 22.0002V12.0002" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Our Products</h1>
        <p className="text-gray-400 max-w-2xl">
          Explore our open-source projects and products. These repositories showcase our commitment to innovation and quality software development.
        </p>
      </div>

      <a 
        href="https://github.com/EonfluxTech-com"
        target="_blank"
        rel="noopener noreferrer"
        className="mb-12 inline-flex items-center px-6 py-3 bg-primary rounded-lg text-white hover:bg-primary/90 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="currentColor"/>
        </svg>
        Visit Our GitHub Organization
      </a>

      <div className="w-full max-w-7xl">
        <div className="flex gap-4 mb-8">
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
              <div className="absolute top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
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
              </div>
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
              <div className="absolute top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
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
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          {filteredAndSortedRepos.map((repo) => (
            <div key={repo.id} className="p-6 bg-gray-800/30 border border-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-white">{repo.name}</h2>
                <div className="flex items-center gap-2 text-gray-400">
                  <span>⭐ {repo.stargazers_count}</span>
                  <span>🔄 {repo.forks_count || 0}</span>
                </div>
              </div>
              <p className="text-gray-400 mb-4">{repo.description}</p>
              <div className="flex flex-wrap gap-2">
                {repo.topics?.map((topic) => (
                  <span key={topic} className="px-2 py-1 text-sm bg-primary/20 text-primary rounded">
                    {topic}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    View Code
                  </a>
                  <a href={`${repo.html_url}/archive/refs/heads/main.zip`} className="text-primary hover:underline">
                    Download
                  </a>
                </div>
                {repo.language && (
                  <span className="text-sm text-gray-400">
                    {repo.language}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 