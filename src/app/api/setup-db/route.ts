import { NextResponse } from 'next/server';
import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

// Setup database API route - only for authorized users
export async function POST(request: Request) {
  try {
    // In a real application, you would add authentication here
    // to ensure only authorized users can run this setup
    
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
      .setKey(process.env.APPWRITE_API_KEY || '');

    const databases = new Databases(client);
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';

    // Check if blogs collection exists, or create it
    try {
      const collection = await databases.getCollection(
        databaseId,
        'blogs'
      );
      console.log('Blogs collection exists:', collection.name);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Blogs collection already exists', 
        collection 
      });
    } catch (error) {
      console.log('Creating blogs collection...');
      const collection = await databases.createCollection(
        databaseId,
        'blogs',
        'Blogs',
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );

      // Create the needed attributes for blog posts
      await databases.createStringAttribute(
        databaseId,
        collection.$id,
        'title',
        255,
        true
      );

      await databases.createStringAttribute(
        databaseId,
        collection.$id,
        'slug',
        255,
        true
      );

      await databases.createStringAttribute(
        databaseId,
        collection.$id,
        'content',
        65535,
        true
      );

      await databases.createStringAttribute(
        databaseId,
        collection.$id,
        'excerpt',
        1024,
        false
      );

      await databases.createStringAttribute(
        databaseId,
        collection.$id,
        'bannerImage',
        1024,
        true
      );

      await databases.createStringAttribute(
        databaseId,
        collection.$id,
        'authorId',
        255,
        true
      );

      await databases.createStringAttribute(
        databaseId,
        collection.$id,
        'authorName',
        255,
        true
      );

      await databases.createBooleanAttribute(
        databaseId,
        collection.$id,
        'published',
        true
      );

      await databases.createStringAttribute(
        databaseId,
        collection.$id,
        'createdAt',
        255,
        true
      );

      await databases.createStringAttribute(
        databaseId,
        collection.$id,
        'updatedAt',
        255,
        true
      );

      await databases.createStringAttribute(
        databaseId,
        collection.$id,
        'tags',
        true, // is array
        false // required
      );

      // Create indexes
      await databases.createIndex(
        databaseId,
        collection.$id,
        'slug_index',
        'key',
        ['slug'],
        true // is unique
      );

      await databases.createIndex(
        databaseId,
        collection.$id,
        'author_index',
        'key',
        ['authorId']
      );

      await databases.createIndex(
        databaseId,
        collection.$id,
        'published_index',
        'key',
        ['published']
      );

      console.log('Blogs collection created with required attributes and indexes');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Blogs collection created successfully', 
        collection 
      });
    }
  } catch (error) {
    console.error('Error setting up blog database:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to set up blog database', 
      error 
    }, { status: 500 });
  }
} 