import { client, account, databases } from './appwrite';
import { Query } from 'appwrite';

// Mock data for demonstration purposes
// In a real application, you would use the Appwrite Server SDK with proper credentials
// to access actual usage statistics from the Appwrite console

export interface AppwriteStats {
  bandwidth: {
    total: number;
    usage: number[];
    labels: string[];
  };
  storage: {
    total: number;
    usage: number[];
    labels: string[];
  };
  requests: {
    total: number;
    usage: number[];
    labels: string[];
  };
  users: {
    total: number;
    growth: number[];
    labels: string[];
  };
  gumroadConnections: number;
}

export async function getAppwriteStats(): Promise<AppwriteStats> {
  try {
    console.log('Fetching stats from API route...');
    
    // Use absolute URL to ensure the request is made to the correct endpoint
    const response = await fetch('/api/admin/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Include credentials to send cookies with the request
      credentials: 'include'
    });
    
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData);
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Received data from API:', data);
    
    // Verify we have real data
    if (data.users && typeof data.users.total === 'number') {
      console.log('Using real data from API');
      return data;
    } else {
      console.log('API returned incomplete data, falling back to mock data');
      return generateMockStats();
    }
  } catch (error) {
    console.error('Error fetching Appwrite stats:', error);
    // Fallback to mock data if the API call fails
    console.log('Falling back to mock data due to error');
    return generateMockStats();
  }
}

// Fallback function to generate mock data if the API call fails
function generateMockStats(): AppwriteStats {
  // Generate last 7 days as labels
  const labels = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  
  // Generate random data for bandwidth usage (in MB)
  const bandwidthUsage = Array.from({ length: 7 }, () => Math.floor(Math.random() * 500) + 100);
  const totalBandwidth = bandwidthUsage.reduce((sum, value) => sum + value, 0);
  
  // Generate random data for storage usage (in MB)
  const storageUsage = Array.from({ length: 7 }, (_, i) => 
    i === 0 ? Math.floor(Math.random() * 1000) + 500 : 0
  );
  
  // Add cumulative storage for each day
  for (let i = 1; i < storageUsage.length; i++) {
    const dailyChange = Math.floor(Math.random() * 100) - 20; // Can decrease sometimes
    storageUsage[i] = Math.max(0, storageUsage[i-1] + dailyChange);
  }
  
  const totalStorage = storageUsage[storageUsage.length - 1];
  
  // Generate random data for API requests
  const requestsUsage = Array.from({ length: 7 }, () => Math.floor(Math.random() * 1000) + 200);
  const totalRequests = requestsUsage.reduce((sum, value) => sum + value, 0);
  
  // Generate random data for user growth
  const userGrowth = [0];
  for (let i = 1; i < 7; i++) {
    userGrowth.push(userGrowth[i-1] + Math.floor(Math.random() * 5) + 1);
  }
  
  return {
    bandwidth: {
      total: totalBandwidth,
      usage: bandwidthUsage,
      labels
    },
    storage: {
      total: totalStorage,
      usage: storageUsage,
      labels
    },
    requests: {
      total: totalRequests,
      usage: requestsUsage,
      labels
    },
    users: {
      total: 25, // Fallback mock value
      growth: userGrowth,
      labels
    },
    gumroadConnections: 0 // Assuming no gumroad connections in mock data
  };
}

export async function getUserCount(): Promise<number> {
  try {
    // Fetch from our API route
    const response = await fetch('/api/admin/stats', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.users.total;
  } catch (error) {
    console.error('Error fetching user count:', error);
    return 25; // Fallback mock value
  }
}

export async function getGumroadConnectionsCount(): Promise<number> {
  try {
    // Fetch from our API route
    const response = await fetch('/api/admin/stats', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.gumroadConnections;
  } catch (error) {
    console.error('Error fetching Gumroad connections count:', error);
    
    // Fallback to direct query if API fails
    try {
      const response = await databases.listDocuments(
        '67d3fa9b00025dff9050', // DATABASE_ID
        'gumroad_connections'   // COLLECTION_ID
      );
      
      return response.total;
    } catch (innerError) {
      console.error('Error with direct query:', innerError);
      return 0;
    }
  }
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  hasGumroadConnection: boolean;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    // Get current user
    const currentUser = await account.get();
    
    if (!currentUser) {
      return null;
    }
    
    // Check if user has a Gumroad connection
    let hasGumroadConnection = false;
    
    try {
      const gumroadConnections = await databases.listDocuments(
        '67d3fa9b00025dff9050', // DATABASE_ID
        'gumroad_connections',  // COLLECTION_ID
        [Query.equal('user_id', currentUser.$id)]
      );
      
      hasGumroadConnection = gumroadConnections.total > 0;
    } catch (error) {
      console.error('Error checking Gumroad connection:', error);
    }
    
    return {
      id: currentUser.$id,
      email: currentUser.email,
      name: currentUser.name || currentUser.email.split('@')[0], // Use part of email if name not available
      hasGumroadConnection
    };
  } catch (error) {
    console.error('Error getting current user profile:', error);
    return null;
  }
}

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  hasGumroadConnection: boolean;
  emailVerification: boolean;
  status: boolean;
}

export async function getAllUsers(): Promise<UserListItem[]> {
  try {
    // Fetch all users from the API route
    const response = await fetch('/api/admin/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data.users)) {
      return data.users.map((user: any) => ({
        id: user.$id,
        email: user.email,
        name: user.name || user.email.split('@')[0],
        createdAt: new Date(user.$createdAt),
        hasGumroadConnection: user.hasGumroadConnection || false,
        emailVerification: user.emailVerification || false,
        status: user.status || false
      }));
    }
    
    throw new Error('Invalid user data format');
  } catch (error) {
    console.error('Error fetching all users:', error);
    return []; // Return empty array on error
  }
}

export type UserAction = 'verify' | 'block' | 'unblock' | 'delete';

export async function performUserAction(userId: string, action: UserAction): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ userId, action })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `Failed to ${action} user`);
    }
    
    return {
      success: true,
      message: data.message || `User ${action}ed successfully`
    };
  } catch (error: any) {
    console.error(`Error performing ${action} on user:`, error);
    return {
      success: false,
      message: error.message || `Failed to ${action} user`
    };
  }
} 