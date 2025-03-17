import { Metadata } from 'next';
import { motion } from 'framer-motion';
import { FiPackage, FiGithub } from 'react-icons/fi';
import RepoGrid from '@/app/components/products/RepoGrid';
import { fetchOrganizationRepos } from '@/lib/github';

export const metadata: Metadata = {
  title: 'Our Products | EonfluxTech',
  description: 'Explore our open-source products and repositories from EonfluxTech',
};

export default async function ProductsPage() {
  // Fetch repositories from GitHub API
  const repos = await fetchOrganizationRepos('EonfluxTech-com');
  
  // Filter out forks and sort by recently updated
  const filteredRepos = repos
    .filter(repo => !repo.fork)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  
  return (
    <div className="container max-w-7xl py-12">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 dark:bg-primary/20 rounded-full mb-4">
          <FiPackage className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Our Products</h1>
        <p className="text-muted-foreground dark:text-gray-400 max-w-2xl mx-auto">
          Explore our open-source projects and products. These repositories showcase our commitment to innovation and quality software development.
        </p>
      </div>
      
      <div className="mb-12 flex justify-center">
        <a 
          href="https://github.com/EonfluxTech-com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <FiGithub className="mr-2 h-5 w-5" />
          Visit Our GitHub Organization
        </a>
      </div>
      
      {repos.length === 0 ? (
        <div className="text-center py-16 bg-muted dark:bg-gray-800 rounded-lg">
          <FiGithub className="h-12 w-12 text-muted-foreground dark:text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No repositories found</h2>
          <p className="text-muted-foreground dark:text-gray-400 max-w-md mx-auto">
            We couldn't fetch repositories from the GitHub API at this time. Please check back later or visit our GitHub organization directly.
          </p>
        </div>
      ) : (
        <RepoGrid repos={filteredRepos} />
      )}
    </div>
  );
} 