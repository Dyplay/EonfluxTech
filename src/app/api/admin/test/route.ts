import { NextResponse } from 'next/server';
import { Client, Users } from 'node-appwrite';

export async function GET(request: Request) {
  try {
    console.log('Test API route called');
    
    // Check if API key is configured
    const apiKey = process.env.APPWRITE_API_KEY;
    if (!apiKey) {
      console.error('APPWRITE_API_KEY is not configured');
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          message: 'API key not configured'
        },
        { status: 500 }
      );
    }
    
    console.log('API key is configured, length:', apiKey.length);

    // Initialize Appwrite Server SDK
    const client = new Client()
      .setEndpoint('https://cloud.appwrite.io/v1')
      .setProject('67d3f589000488385c35') // Your project ID
      .setKey(apiKey); // API key from environment variable

    const users = new Users(client);

    try {
      // Simple test to get user count
      const usersList = await users.list();
      const totalUsers = usersList.total;
      
      return NextResponse.json({
        success: true,
        message: 'API key is working correctly',
        userCount: totalUsers
      });
    } catch (apiError: any) {
      console.error('Appwrite API error:', apiError);
      
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
    console.error('Error in test API route:', error);
    return NextResponse.json(
      { 
        error: 'Test failed',
        message: error.message
      },
      { status: 500 }
    );
  }
} 