import { NextResponse } from 'next/server';
import { Client, Teams } from 'node-appwrite';

// A simple API route that tests the connection to Appwrite
export async function GET() {
  try {
    // Log environment variables for debugging (masked for security)
    console.log('Testing Appwrite connection:');
    console.log('Endpoint exists:', !!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
    console.log('Project ID exists:', !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    console.log('API Key exists:', !!process.env.APPWRITE_API_KEY);
    
    // Validate required environment variables
    if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing NEXT_PUBLIC_APPWRITE_ENDPOINT environment variable'
      }, { status: 500 });
    }
    
    if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID environment variable'
      }, { status: 500 });
    }
    
    if (!process.env.APPWRITE_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing APPWRITE_API_KEY environment variable'
      }, { status: 500 });
    }
    
    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);
    
    // Make an actual API call to verify the connection
    const teams = new Teams(client);
    
    // Get total team count (this is a lightweight call that just verifies our connection and permissions)
    const teamsList = await teams.list('1', '0'); // Just get 1 team to minimize data transfer
    
    return NextResponse.json({ 
      success: true, 
      message: 'Appwrite connection successful',
      details: {
        endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
        projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.substring(0, 4) + '...',
        totalTeams: teamsList.total
      }
    });
  } catch (error: any) {
    console.error('Error testing Appwrite connection:', error);
    
    let errorMessage = 'Failed to connect to Appwrite';
    
    // Enhance error message based on common issues
    if (error.code === 401) {
      errorMessage = 'Authentication failed. Check your API key permissions.';
    } else if (error.code === 404) {
      errorMessage = 'Resource not found. Check your project ID.';
    } else if (error.code === 0 || error.code === 'ECONNREFUSED') {
      errorMessage = 'Could not connect to Appwrite. Check your endpoint URL and network connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ 
      success: false, 
      message: errorMessage,
      error: {
        code: error.code,
        message: error.message,
        type: error.type
      }
    }, { status: 500 });
  }
} 