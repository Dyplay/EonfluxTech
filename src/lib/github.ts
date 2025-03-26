export interface GitHubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  language: string;
  updated_at: string;
  fork: boolean;
  forks_count: number;
  topics: string[];
  homepage: string | null;
}

// List of repositories to exclude
const BLACKLISTED_REPOS = ['.github'];

export async function getGithubRepos(): Promise<GitHubRepo[]> {
  try {
    const response = await fetch('https://api.github.com/users/EonfluxTech-com/repos', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch GitHub repos');
    }

    const data = await response.json();
    // Filter out blacklisted repositories
    return data.filter((repo: GitHubRepo) => !BLACKLISTED_REPOS.includes(repo.name));
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return [];
  }
} 