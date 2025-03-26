import { NextResponse } from 'next/server';
import { Client, Databases, ID, Permission, Role, IndexType } from 'node-appwrite';

// Setup database API route - only for authorized users
export async function POST(request: Request) {
  try {
    // Log environment variables for debugging (masked for security)
    console.log('Environment check:');
    console.log('Endpoint exists:', !!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
    console.log('Project ID exists:', !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    console.log('API Key exists:', !!process.env.APPWRITE_API_KEY);
    console.log('Database ID exists:', !!process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
    
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
      .setKey(process.env.APPWRITE_API_KEY || '');

    const databases = new Databases(client);
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';

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
    
    if (!databaseId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing NEXT_PUBLIC_APPWRITE_DATABASE_ID environment variable'
      }, { status: 500 });
    }

    console.log('Checking if database exists...');
    
    // Check if database exists and create it if it doesn't
    let databaseExists = false;
    try {
      // Try to get database by ID first
      await databases.get(databaseId);
      databaseExists = true;
      console.log('Database exists with ID:', databaseId);
    } catch (dbError: any) {
      console.log('Database get error:', dbError);
      
      // If error is 404, database doesn't exist
      if (dbError.code === 404) {
        console.log('Database does not exist, attempting to create it...');
        try {
          // Create the database
          const newDb = await databases.create(
            databaseId,
            'EonfluxTech Database'
          );
          console.log('Database created successfully:', newDb.name);
          databaseExists = true;
        } catch (createDbError: any) {
          console.error('Error creating database:', createDbError);
          return NextResponse.json({ 
            success: false, 
            message: 'Failed to create database: ' + (createDbError.message || createDbError),
            error: createDbError
          }, { status: 500 });
        }
      } else {
        // If error isn't 404, it's another issue (permissions, etc.)
        console.error('Error checking database:', dbError);
        return NextResponse.json({ 
          success: false, 
          message: 'Error accessing database: ' + (dbError.message || dbError),
          error: dbError
        }, { status: 500 });
      }
    }
    
    // Check if the database was successfully created or already existed
    if (!databaseExists) {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to create or access database'
      }, { status: 500 });
    }
    
    // Check if blogs collection exists, or create it
    try {
      console.log('Checking if blogs collection exists...');
      const collection = await databases.getCollection(
        databaseId,
        'blogs'
      );
      console.log('Blogs collection exists:', collection.name);
      
      // Check if post_likes collection exists
      try {
        await databases.getCollection(databaseId, 'post_likes');
        console.log('Post likes collection exists');
      } catch (error: any) {
        if (error.code === 404) {
          console.log('Creating post_likes collection...');
          const postLikesCollection = await databases.createCollection(
            databaseId,
            'post_likes',
            'Post Likes',
            [
              Permission.read(Role.any()),
              Permission.create(Role.users()),
              Permission.update(Role.users()),
              Permission.delete(Role.users())
            ]
          );

          // Create attributes for post_likes
          await databases.createStringAttribute(
            databaseId,
            postLikesCollection.$id,
            'userId',
            255,
            true
          );

          await databases.createStringAttribute(
            databaseId,
            postLikesCollection.$id,
            'postId',
            255,
            true
          );

          await databases.createStringAttribute(
            databaseId,
            postLikesCollection.$id,
            'likedAt',
            128,
            true
          );

          // Create indexes
          await databases.createIndex(
            databaseId,
            postLikesCollection.$id,
            'user_post_index',
            IndexType.Unique,
            ['userId', 'postId'],
            []
          );
        }
      }

      // Check if saved_posts collection exists
      try {
        await databases.getCollection(databaseId, 'saved_posts');
        console.log('Saved posts collection exists');
      } catch (error: any) {
        if (error.code === 404) {
          console.log('Creating saved_posts collection...');
          const savedPostsCollection = await databases.createCollection(
            databaseId,
            'saved_posts',
            'Saved Posts',
            [
              Permission.read(Role.users()),
              Permission.create(Role.users()),
              Permission.update(Role.users()),
              Permission.delete(Role.users())
            ]
          );

          // Create attributes for saved_posts
          await databases.createStringAttribute(
            databaseId,
            savedPostsCollection.$id,
            'userId',
            255,
            true
          );

          await databases.createStringAttribute(
            databaseId,
            savedPostsCollection.$id,
            'postId',
            255,
            true
          );

          await databases.createStringAttribute(
            databaseId,
            savedPostsCollection.$id,
            'postTitle',
            255,
            true
          );

          await databases.createStringAttribute(
            databaseId,
            savedPostsCollection.$id,
            'postSlug',
            255,
            true
          );

          await databases.createStringAttribute(
            databaseId,
            savedPostsCollection.$id,
            'postBannerImage',
            512,
            true
          );

          await databases.createStringAttribute(
            databaseId,
            savedPostsCollection.$id,
            'postExcerpt',
            500,
            false
          );

          await databases.createStringAttribute(
            databaseId,
            savedPostsCollection.$id,
            'savedAt',
            128,
            true
          );

          // Create indexes
          await databases.createIndex(
            databaseId,
            savedPostsCollection.$id,
            'user_post_index',
            IndexType.Unique,
            ['userId', 'postId'],
            []
          );
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'All collections exist or were created successfully', 
        collection 
      });
    } catch (error: any) {
      console.log('Collection error:', error);
      console.log('Creating blogs collection...');
      
      try {
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

        console.log('Collection created, adding attributes...');

        // Create the needed attributes for blog posts with proper parameter order
        
        // Title
        await databases.createStringAttribute(
          databaseId,
          collection.$id,
          'title',
          255,
          true // required
        );

        // Slug
        await databases.createStringAttribute(
          databaseId,
          collection.$id,
          'slug',
          255,
          true // required
        );

        // Content - reduced size to prevent issues
        await databases.createStringAttribute(
          databaseId,
          collection.$id,
          'content',
          10000, // Reduced to be safer
          true // required
        );

        // Excerpt
        await databases.createStringAttribute(
          databaseId,
          collection.$id,
          'excerpt',
          500, // Reduced to be safer
          false // not required
        );

        // Banner Image
        await databases.createStringAttribute(
          databaseId,
          collection.$id,
          'bannerImage',
          512, // Reduced to be safer for URLs
          true // required
        );

        // Author ID
        await databases.createStringAttribute(
          databaseId,
          collection.$id,
          'authorId',
          255,
          true // required
        );

        // Author Name
        await databases.createStringAttribute(
          databaseId,
          collection.$id,
          'authorName',
          255,
          true // required
        );

        // Published status
        await databases.createBooleanAttribute(
          databaseId,
          collection.$id,
          'published',
          true // required
        );

        // Created At
        await databases.createStringAttribute(
          databaseId,
          collection.$id,
          'createdAt',
          128, // Safe size for ISO date strings
          true // required
        );

        // Updated At
        await databases.createStringAttribute(
          databaseId,
          collection.$id,
          'updatedAt',
          128, // Safe size for ISO date strings
          true // required
        );

        // Tags - as a comma-separated string instead of an array
        await databases.createStringAttribute(
          databaseId,
          collection.$id,
          'tags',
          500, // Enough space for many comma-separated tags
          false // Not required
        );

        console.log('Creating indexes...');
        // Create indexes
        await databases.createIndex(
          databaseId,
          collection.$id,
          'slug_index',
          IndexType.Unique,
          ['slug'],
          [] // orders parameter
        );

        await databases.createIndex(
          databaseId,
          collection.$id,
          'author_index',
          IndexType.Key,
          ['authorId'],
          [] // orders parameter
        );

        await databases.createIndex(
          databaseId,
          collection.$id,
          'published_index',
          IndexType.Key,
          ['published'],
          [] // orders parameter
        );

        console.log('Blogs collection created with required attributes and indexes');
        
        return NextResponse.json({ 
          success: true, 
          message: 'Blogs collection created successfully', 
          collection 
        });
      } catch (createError: any) {
        console.error('Error creating collection:', createError);
        return NextResponse.json({ 
          success: false, 
          message: 'Failed to create blogs collection: ' + (createError.message || createError),
          error: createError
        }, { status: 500 });
      }
    }
  } catch (error: any) {
    console.error('Error setting up blog database:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to set up blog database: ' + (error.message || error),
      error 
    }, { status: 500 });
  }
} 