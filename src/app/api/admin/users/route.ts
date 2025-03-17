import { NextResponse } from 'next/server';
import { Client, Users, Databases, Query, ID } from 'node-appwrite';

// Helper function to initialize Appwrite client
function initAppwrite() {
  const apiKey = process.env.APPWRITE_API_KEY;
  if (!apiKey) {
    throw new Error('APPWRITE_API_KEY is not configured');
  }
  
  const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67d3f589000488385c35')
    .setKey(apiKey);

  return {
    client,
    users: new Users(client),
    databases: new Databases(client)
  };
}

export async function GET(request: Request) {
  try {
    console.log('Admin users API route called');
    
    const { client, users, databases } = initAppwrite();

    try {
      console.log('Fetching all users...');
      // Get all users
      const usersList = await users.list();
      
      if (!usersList || !usersList.users) {
        throw new Error('Failed to fetch users list');
      }
      
      console.log(`Found ${usersList.total} users`);
      
      // Get all Gumroad connections
      console.log('Fetching Gumroad connections...');
      const gumroadConnections = await databases.listDocuments(
        '67d3fa9b00025dff9050', // DATABASE_ID 
        'gumroad_connections'   // COLLECTION_ID
      );
      
      console.log(`Found ${gumroadConnections.total} Gumroad connections`);
      
      // Create a map of user IDs to Gumroad connection status
      const userGumroadMap = new Map();
      gumroadConnections.documents.forEach(connection => {
        if (connection.user_id) {
          userGumroadMap.set(connection.user_id, true);
        }
      });
      
      // Add Gumroad connection status to each user
      const usersWithConnections = usersList.users.map(user => {
        return {
          ...user,
          hasGumroadConnection: userGumroadMap.has(user.$id)
        };
      });
      
      return NextResponse.json({
        total: usersList.total,
        users: usersWithConnections
      });
    } catch (apiError: any) {
      console.error('Appwrite API error:', apiError);
      
      // Return a more specific error message
      return NextResponse.json(
        { 
          error: 'Failed to fetch Appwrite users data',
          message: apiError.message,
          code: apiError.code
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in users API route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Appwrite users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { action, userId } = await request.json();
    
    if (!action || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    console.log(`Admin users API action: ${action} for user: ${userId}`);
    
    const { users } = initAppwrite();
    
    switch (action) {
      case 'verify':
        try {
          // Verify user's email
          await users.updateEmailVerification(userId, true);
          return NextResponse.json({ 
            success: true, 
            message: 'User email verified successfully' 
          });
        } catch (error: any) {
          console.error('Error verifying user:', error);
          return NextResponse.json(
            { error: error.message || 'Failed to verify user' },
            { status: 500 }
          );
        }
        
      case 'block':
        try {
          // Block user account
          await users.updateStatus(userId, false);
          return NextResponse.json({ 
            success: true, 
            message: 'User blocked successfully' 
          });
        } catch (error: any) {
          console.error('Error blocking user:', error);
          return NextResponse.json(
            { error: error.message || 'Failed to block user' },
            { status: 500 }
          );
        }
        
      case 'unblock':
        try {
          // Unblock user account
          await users.updateStatus(userId, true);
          return NextResponse.json({ 
            success: true, 
            message: 'User unblocked successfully' 
          });
        } catch (error: any) {
          console.error('Error unblocking user:', error);
          return NextResponse.json(
            { error: error.message || 'Failed to unblock user' },
            { status: 500 }
          );
        }
        
      case 'delete':
        try {
          // Delete user account
          await users.delete(userId);
          return NextResponse.json({ 
            success: true, 
            message: 'User deleted successfully' 
          });
        } catch (error: any) {
          console.error('Error deleting user:', error);
          return NextResponse.json(
            { error: error.message || 'Failed to delete user' },
            { status: 500 }
          );
        }
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error in users API route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process user action' },
      { status: 500 }
    );
  }
} 