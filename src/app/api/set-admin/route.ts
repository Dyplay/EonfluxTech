import { NextRequest, NextResponse } from 'next/server';
import { account } from '@/lib/appwrite';
import { getCurrentUser } from '@/lib/auth';

// This is a secure API route for setting admin privileges
export async function POST(request: NextRequest) {
  try {
    // Check if requester is already an admin
    const currentUser = await getCurrentUser();
    if (!currentUser.data) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Only superadmin can grant admin privileges
    const isSuperAdmin = currentUser.data?.prefs?.superadmin === true;
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    // Get user ID from request
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Update user preferences to make them admin
    const updatedPrefs = await account.updatePrefs({ admin: true });

    return NextResponse.json({ 
      success: true, 
      message: 'Admin privileges granted',
      user: updatedPrefs
    });
    
  } catch (error: any) {
    console.error('Error setting admin:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to set admin privileges'
    }, { status: 500 });
  }
} 