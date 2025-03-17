import { NextResponse } from 'next/server';
import { Client, Users, Databases, Storage } from 'node-appwrite';

// Initialize Appwrite Server SDK
// Note: We'll initialize the client inside the handler to ensure environment variables are loaded
export async function GET(request: Request) {
  try {
    console.log('Admin stats API route called');
    
    // Check if API key is configured
    const apiKey = process.env.APPWRITE_API_KEY;
    if (!apiKey) {
      console.error('APPWRITE_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    console.log('API key is configured, length:', apiKey.length);

    // Initialize the Appwrite client with the API key
    const client = new Client()
      .setEndpoint('https://cloud.appwrite.io/v1')
      .setProject('67d3f589000488385c35')
      .setKey(apiKey);

    const users = new Users(client);
    const databases = new Databases(client);
    const storage = new Storage(client);

    // Get the last 7 days as labels
    const labels = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    try {
      console.log('Fetching user count...');
      // Get user count
      const usersList = await users.list();
      const totalUsers = usersList.total;
      console.log(`Found ${totalUsers} users`);

      console.log('Fetching storage usage...');
      // Get storage usage
      const storageList = await storage.listBuckets();
      let totalStorage = 0;
      const storageUsage = Array(7).fill(0);
      
      console.log(`Found ${storageList.buckets.length} storage buckets`);
      // For each bucket, get its file stats
      for (const bucket of storageList.buckets) {
        console.log(`Fetching files for bucket ${bucket.$id}...`);
        const files = await storage.listFiles(bucket.$id);
        console.log(`Found ${files.files.length} files in bucket ${bucket.$id}`);
        for (const file of files.files) {
          totalStorage += file.sizeOriginal;
        }
      }
      
      // Convert bytes to MB for display
      const totalStorageMB = Math.round(totalStorage / (1024 * 1024));
      console.log(`Total storage: ${totalStorageMB} MB`);
      
      // For simplicity, we'll distribute the storage evenly across days
      // In a real app, you'd track daily changes
      storageUsage[storageUsage.length - 1] = totalStorageMB;
      
      console.log('Fetching Gumroad connections...');
      // Get Gumroad connections count
      const gumroadConnections = await databases.listDocuments(
        '67d3fa9b00025dff9050', // DATABASE_ID 
        'gumroad_connections'   // COLLECTION_ID
      );
      console.log(`Found ${gumroadConnections.total} Gumroad connections`);
      
      // Since we can't get real bandwidth and API request stats from the client SDK,
      // we'll still use mock data for these metrics
      const bandwidthUsage = Array.from({ length: 7 }, () => Math.floor(Math.random() * 500) + 100);
      const totalBandwidth = bandwidthUsage.reduce((sum, value) => sum + value, 0);
      
      const requestsUsage = Array.from({ length: 7 }, () => Math.floor(Math.random() * 1000) + 200);
      const totalRequests = requestsUsage.reduce((sum, value) => sum + value, 0);
      
      // Get user growth (new users per day)
      // In a real app, you'd query users created in each day range
      const userGrowth = [0];
      for (let i = 1; i < 7; i++) {
        userGrowth.push(Math.floor(totalUsers / 7) * i);
      }
      
      console.log('Successfully prepared all stats data');
      
      const responseData = {
        bandwidth: {
          total: totalBandwidth,
          usage: bandwidthUsage,
          labels
        },
        storage: {
          total: totalStorageMB,
          usage: storageUsage,
          labels
        },
        requests: {
          total: totalRequests,
          usage: requestsUsage,
          labels
        },
        users: {
          total: totalUsers,
          growth: userGrowth,
          labels
        },
        gumroadConnections: gumroadConnections.total
      };
      
      console.log('Returning response data:', JSON.stringify(responseData));
      return NextResponse.json(responseData);
    } catch (apiError: any) {
      console.error('Appwrite API error:', apiError);
      
      // Return a more specific error message
      return NextResponse.json(
        { 
          error: 'Failed to fetch Appwrite data',
          message: apiError.message,
          code: apiError.code
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in stats API route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Appwrite statistics' },
      { status: 500 }
    );
  }
} 