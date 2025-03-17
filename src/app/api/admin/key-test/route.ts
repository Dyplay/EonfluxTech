import { NextResponse } from 'next/server';
import { Client } from 'node-appwrite';

export async function GET(request: Request) {
  try {
    // Get the API key from environment variables
    const apiKey = process.env.APPWRITE_API_KEY;
    
    // Check if API key is configured
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'API key is not configured in environment variables',
        apiKeyExists: false
      });
    }
    
    // Return basic information about the API key
    return NextResponse.json({
      success: true,
      message: 'API key is configured',
      apiKeyExists: true,
      apiKeyLength: apiKey.length,
      apiKeyFirstChars: apiKey.substring(0, 10) + '...',
      apiKeyLastChars: '...' + apiKey.substring(apiKey.length - 10)
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Error checking API key',
      error: error.message
    });
  }
} 