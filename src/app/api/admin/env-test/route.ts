import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get all environment variables
    const envVars = process.env;
    
    // Create a safe version that doesn't expose actual values
    const safeEnvVars: Record<string, string> = {};
    
    // Check for specific environment variables we're interested in
    const keysToCheck = [
      'APPWRITE_API_KEY',
      'APPWRITE_ENDPOINT',
      'APPWRITE_PROJECT_ID',
      'NEXT_PUBLIC_APPWRITE_ENDPOINT',
      'NEXT_PUBLIC_APPWRITE_PROJECT_ID'
    ];
    
    for (const key of keysToCheck) {
      const value = envVars[key];
      if (value) {
        // For API keys, just show length and first/last few chars
        if (key.includes('KEY') || key.includes('SECRET')) {
          safeEnvVars[key] = `${value.substring(0, 4)}...${value.substring(value.length - 4)} (length: ${value.length})`;
        } else {
          safeEnvVars[key] = value;
        }
      } else {
        safeEnvVars[key] = 'NOT SET';
      }
    }
    
    // Add a list of all environment variable names (without values)
    const allEnvKeys = Object.keys(envVars).filter(key => 
      !key.includes('KEY') && !key.includes('SECRET') && !key.includes('PASSWORD')
    );
    
    return NextResponse.json({
      success: true,
      message: 'Environment variables check',
      variables: safeEnvVars,
      allEnvKeys
    });
  } catch (error: any) {
    console.error('Error checking environment variables:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check environment variables',
        message: error.message
      },
      { status: 500 }
    );
  }
} 