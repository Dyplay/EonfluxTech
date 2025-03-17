export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  visibility: string;
}

/**
 * Fetches repositories from the specified GitHub organization
 * @param orgName The GitHub organization name
 * @returns Array of repositories
 */
export async function fetchOrganizationRepos(orgName: string = 'EonfluxTech-com'): Promise<GitHubRepo[]> {
  try {
    console.log(`Fetching repositories for organization: ${orgName}`);
    
    // Use the correct endpoint for organization repositories
    const apiUrl = `https://api.github.com/orgs/${orgName}/repos?sort=updated&per_page=100&type=all`;
    console.log(`API URL: ${apiUrl}`);
    
    // GitHub API token from environment variable (if available)
    const githubToken = process.env.GITHUB_TOKEN || '';
    console.log(`GitHub token available: ${githubToken ? 'Yes' : 'No'}`);
    
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    
    // Add authorization header if token is available
    if (githubToken) {
      headers['Authorization'] = `Bearer ${githubToken}`;
      console.log('Using GitHub token for authentication');
    } else {
      console.log('No GitHub token found, using unauthenticated request (rate limits apply)');
    }
    
    console.log('Request headers:', headers);
    
    const response = await fetch(
      apiUrl,
      {
        headers,
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );

    console.log(`API Response Status: ${response.status}`);
    console.log(`API Response Status Text: ${response.statusText}`);
    console.log(`API Response Headers:`, Object.fromEntries([...response.headers.entries()]));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GitHub API error (${response.status}): ${errorText}`);
      
      // Check for common error cases
      if (response.status === 404) {
        console.error(`Organization "${orgName}" not found. Please check the organization name.`);
        console.error(`Try visiting https://github.com/${orgName} to verify the organization exists.`);
      } else if (response.status === 403) {
        console.error('Rate limit exceeded or access denied. Consider using authenticated requests.');
        
        // Check rate limit headers if available
        const rateLimit = response.headers.get('x-ratelimit-limit');
        const rateRemaining = response.headers.get('x-ratelimit-remaining');
        const rateReset = response.headers.get('x-ratelimit-reset');
        
        if (rateLimit && rateRemaining && rateReset) {
          const resetDate = new Date(parseInt(rateReset) * 1000);
          console.error(`Rate limit: ${rateRemaining}/${rateLimit}, resets at ${resetDate.toLocaleString()}`);
        }
        
        console.error('To increase rate limits, set a GITHUB_TOKEN environment variable in your .env.local file:');
        console.error('GITHUB_TOKEN=your_personal_access_token');
      }
      
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const responseText = await response.text();
    console.log('Raw API Response:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
    
    let repos;
    try {
      repos = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse GitHub API response as JSON:', parseError);
      console.error('Response was not valid JSON. First 500 characters:', responseText.substring(0, 500));
      return [];
    }
    
    console.log(`Successfully fetched ${repos.length} repositories`);
    console.log('First repository sample:', repos.length > 0 ? JSON.stringify(repos[0], null, 2) : 'No repositories found');
    
    // Add some basic validation
    if (!Array.isArray(repos)) {
      console.error('GitHub API did not return an array:', repos);
      return [];
    }
    
    return repos as GitHubRepo[];
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    
    // Return empty array but also log a more helpful message
    console.log('Please check:');
    console.log('1. The organization name is correct (case-sensitive)');
    console.log('2. The organization has public repositories');
    console.log('3. GitHub API is accessible from your environment');
    console.log('4. You have not exceeded GitHub API rate limits');
    console.log('5. Network connectivity and firewall settings');
    console.log('6. Try adding a GitHub token to your .env.local file for higher rate limits');
    
    return [];
  }
} 