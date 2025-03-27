'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FiGithub, FiExternalLink, FiCode, FiPackage, FiServer, FiDownload } from 'react-icons/fi';
import { getGithubRepos } from '@/lib/github';
import Script from 'next/script';
import { motion } from 'framer-motion';

const EarthModel = dynamic(() => import('./components/EarthModel'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-primary animate-pulse">Loading 3D Model...</div>
    </div>
  ),
});

// Mock repositories to use as fallback if GitHub API fails
const mockRepos = [
  {
    id: 1,
    name: "Example Project 1",
    description: "This is an example project placeholder. It appears when we can't connect to GitHub API.",
    html_url: "https://github.com/EonfluxTech-com",
    homepage: null,
    topics: ["example", "placeholder"],
    language: "TypeScript",
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Example Project 2",
    description: "Another example placeholder. Your real projects will appear here when they're available on GitHub.",
    html_url: "https://github.com/EonfluxTech-com",
    homepage: null,
    topics: ["example", "placeholder"],
    language: "JavaScript",
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: "Example Project 3",
    description: "This is not a real project. Check our GitHub organization to see our actual repositories.",
    html_url: "https://github.com/EonfluxTech-com",
    homepage: null,
    topics: ["example", "placeholder"],
    language: "Python",
    updated_at: new Date().toISOString()
  }
];

export default async function Home() {
  // Fetch repositories from GitHub API
  let featuredRepos = [];
  let usingMockData = false;
  
  try {
    console.log('Attempting to fetch GitHub repositories...');
    const allRepos = await getGithubRepos();
    
    console.log('GitHub API response received:', {
      reposCount: allRepos?.length || 0,
      isEmpty: !allRepos || allRepos.length === 0,
      isArray: Array.isArray(allRepos)
    });
    
    if (allRepos && allRepos.length > 0) {
      console.log(`Successfully fetched ${allRepos.length} repositories from GitHub`);
      console.log('Repository names:', allRepos.map(repo => repo.name).join(', '));
      
      // Filter out forks and get the 3 most recently updated repos
      const nonForkedRepos = allRepos.filter(repo => !repo.fork);
      console.log(`Found ${nonForkedRepos.length} non-forked repositories`);
      
      featuredRepos = nonForkedRepos
        .sort((a, b) => {
          // Sort by activity (updated_at date)
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        })
        .slice(0, 3);
      
      console.log('Featured repos selected:', featuredRepos.map(repo => repo.name).join(', '));
    } else {
      console.log('No repositories found or API call failed, using mock data');
      featuredRepos = mockRepos;
      usingMockData = true;
    }
  } catch (error) {
    console.error('Error fetching repositories:', error);
    console.log('Falling back to mock data');
    featuredRepos = mockRepos;
    usingMockData = true;
  }

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get icon for repository based on language or name
  const getRepoIcon = (repo: any) => {
    const language = repo.language?.toLowerCase();
    const name = repo.name.toLowerCase();
    
    if (language === 'typescript' || language === 'javascript') {
      return <FiCode className="h-5 w-5" />;
    } else if (language === 'python' || name.includes('api')) {
      return <FiServer className="h-5 w-5" />;
    } else {
      return <FiPackage className="h-5 w-5" />;
    }
  };

  // Create a safe JSON string for the client-side script
  const reposDataJson = JSON.stringify({
    featuredRepos: featuredRepos.map(repo => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      html_url: repo.html_url,
      language: repo.language,
      topics: repo.topics
    })),
    usingMockData
  }).replace(/</g, '\\u003c');

  return (
    <div className="relative min-h-screen">
      {/* Client-side logging script */}
      <Script id="debug-script" strategy="afterInteractive">
        {`
          console.log('=== CLIENT SIDE LOGGING ===');
          const reposData = ${reposDataJson};
          console.log('Featured repos data:', reposData.featuredRepos);
          console.log('Using mock data:', reposData.usingMockData);
          
          // Test different variations of the organization name
          const orgNames = ['EonfluxTech-com', 'eonfluxtech-com', 'Eonfluxtech-com'];
          
          // Check if GitHub API is accessible and if the organization exists
          fetch('https://api.github.com/orgs/EonfluxTech-com')
            .then(response => {
              console.log('GitHub organization API test response status:', response.status);
              if (response.ok) {
                console.log('Organization exists! Checking for repositories...');
                return response.json();
              } else {
                console.error('Organization not found or API error. Status:', response.status);
                throw new Error('Organization not found');
              }
            })
            .then(data => {
              console.log('GitHub organization data:', data);
              
              // Now check for repositories with different parameters
              return fetch('https://api.github.com/orgs/EonfluxTech-com/repos?per_page=100&type=all');
            })
            .then(response => {
              console.log('GitHub repositories API test response status:', response.status);
              return response.json();
            })
            .then(repos => {
              console.log('GitHub repositories count:', repos.length);
              if (repos.length === 0) {
                console.log('The organization exists but has no public repositories.');
                
                // Try with different case for organization name
                console.log('Trying with lowercase organization name...');
                return fetch('https://api.github.com/orgs/eonfluxtech-com/repos?per_page=100');
              } else {
                console.log('Repository names:', repos.map(repo => repo.name).join(', '));
                console.log('Repository details:', repos.map(repo => ({
                  name: repo.name,
                  private: repo.private,
                  fork: repo.fork,
                  visibility: repo.visibility
                })));
                return null;
              }
            })
            .then(response => {
              if (response) {
                return response.json();
              }
              return null;
            })
            .then(repos => {
              if (repos) {
                console.log('Lowercase org repositories count:', repos.length);
                console.log('Lowercase org repository names:', repos.map(repo => repo.name).join(', '));
              }
            })
            .catch(error => {
              console.error('Error testing GitHub API:', error);
            });
        `}
      </Script>

      <main>
        <section className="hero">
          {/* Animated Background - Only in hero section */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 animate-gradient" />
            <motion.div
              initial={{ opacity: 0.4 }}
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.3),transparent_70%)]"
            />
            <motion.div
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.3),transparent_70%)]"
            />
          </div>

          <div className="hero-content">
            <h1 className="hero-title">
              Building the future of open source software
            </h1>
            <p className="hero-description">
              Creating universal and simple software that empowers developers and users alike.
            </p>
            <div className="hero-buttons">
              <Link href="/products" className="btn btn-primary">
                Explore Products
              </Link>
              <Link
                href="/about"
                className="btn bg-accent hover:bg-accent/80"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 bg-accent">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Our Products</h2>
            <div className="feature-grid">
              {featuredRepos.length > 0 ? (
                featuredRepos.map(repo => (
                  <div key={repo.id} className="card">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        {getRepoIcon(repo)}
                      </div>
                      <h3 className="text-xl font-semibold">{repo.name}</h3>
                    </div>
                    <p className="text-secondary mb-4">
                      {repo.description || 'No description provided'}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 text-sm text-primary">
                        {repo.topics && repo.topics.length > 0 ? (
                          <>
                            <span>{repo.topics[0]}</span>
                            {repo.topics.length > 1 && (
                              <>
                                <span>•</span>
                                <span>{repo.topics[1]}</span>
                              </>
                            )}
                          </>
                        ) : (
                          <span>Updated {formatDate(repo.updated_at)}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link 
                          href={repo.html_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 transition-colors"
                          title="View Repository"
                        >
                          <FiGithub className="h-5 w-5" />
                        </Link>
                        <Link 
                          href={`${repo.html_url}/releases`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 transition-colors"
                          title="Download Releases"
                        >
                          <FiDownload className="h-5 w-5" />
                        </Link>
                        {repo.homepage && (
                          <Link 
                            href={repo.homepage} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors"
                            title="View Live Demo"
                          >
                            <FiExternalLink className="h-5 w-5" />
                          </Link>
                        )}
                      </div>
                    </div>
                    {usingMockData && (
                      <div className="mt-4 text-xs text-muted-foreground bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                        <span className="font-medium">Note:</span> This is a placeholder example. No real projects could be retrieved from GitHub at this time.
                      </div>
                    )}
                  </div>
                ))
              ) : (
                // Message when no repositories are found
                <div className="col-span-3 text-center py-12 bg-background/50 rounded-lg border border-border">
                  <FiGithub className="mx-auto h-12 w-12 text-primary/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Exciting Projects Coming Soon!</h3>
                  <p className="text-secondary max-w-md mx-auto mb-4">
                    We're working on some amazing open-source projects that will be available here soon. 
                    Check back later or visit our GitHub organization to see our latest work.
                  </p>
                  <Link 
                    href="https://github.com/EonfluxTech-com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <FiGithub className="mr-2 h-4 w-4" />
                    Visit Our GitHub
                  </Link>
                </div>
              )}
            </div>
            <div className="mt-12 text-center">
              <Link 
                href="/products" 
                className="inline-flex items-center px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                View All Products
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">About EonfluxTech</h2>
                <p className="text-secondary text-lg">
                  EonfluxTech is a technology company focused on creating open-source software that is both powerful and accessible. Our mission is to build tools that empower developers and enhance the digital experience for everyone.
                </p>
                <ul className="grid sm:grid-cols-2 gap-4">
                  <li className="flex gap-2 items-start">
                    <div className="rounded-full p-1.5 bg-primary/10 text-primary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Open Source</h3>
                      <p className="text-sm text-secondary">Transparency and community-driven</p>
                    </div>
                  </li>
                  <li className="flex gap-2 items-start">
                    <div className="rounded-full p-1.5 bg-primary/10 text-primary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Cross-Platform</h3>
                      <p className="text-sm text-secondary">Works on all devices</p>
                    </div>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link 
                    href="/about" 
                    className="inline-flex items-center px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden">
                <div className="absolute inset-0">
                  <EarthModel />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
