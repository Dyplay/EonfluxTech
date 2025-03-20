import Link from 'next/link';
import Image from 'next/image';
import { databases, storage } from '@/lib/appwrite';
import { BlogPost, Author } from '@/lib/types';
import { Query } from 'appwrite';
import { cookies } from 'next/headers';

// Function to get user data including preferences (avatar)
async function getUserById(userId: string) {
  try {
    // Try to get the user document from users collection first
    try {
      const response = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'users',
        userId
      );
      
      if (response && response.avatarUrl) {
        return { avatarUrl: response.avatarUrl };
      }
    } catch (error) {
      console.log('No user document found in database');
    }
    
    // Then check if this post has authorAvatar
    try {
      // Find a post with this authorId that might have authorAvatar
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'blogs',
        [Query.equal('authorId', userId)]
      );
      
      if (response.documents.length > 0) {
        const post = response.documents[0];
        if (post.authorAvatar) {
          return { avatarUrl: post.authorAvatar };
        }
      }
    } catch (error) {
      console.log('No matching posts found or no authorAvatar');
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    // Check if user is authenticated to determine if we show drafts
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('appwrite_session');
    const isAuthenticated = !!sessionCookie;
    
    const queries = [Query.orderDesc('createdAt')];
    
    // Only show published posts to non-authenticated users
    if (!isAuthenticated) {
      queries.push(Query.equal('published', true));
    }
    
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      'blogs',
      queries
    );
    // Cast to unknown first, then to BlogPost[] to avoid TypeScript error
    return response.documents as unknown as BlogPost[];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

async function getAuthor(authorId: string): Promise<Author | null> {
  try {
    const response = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      'users',
      authorId
    );
    // Cast to unknown first, then to Author to avoid TypeScript error
    return response as unknown as Author;
  } catch (error) {
    console.error('Error fetching author:', error);
    return null;
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      
      <div className="grid gap-8">
        {posts.map(async (post) => {
          // Get author information
          const author = await getAuthor(post.authorId);
          
          // Get user preferences with avatar URL
          const userData = post.authorId ? await getUserById(post.authorId) : null;
          
          // Get author profile picture URL
          let authorImageUrl = null;
          try {
            // First check if we got avatar from user preferences
            if (userData && userData.avatarUrl) {
              authorImageUrl = userData.avatarUrl;
            }
            // Then check if author has avatarUrl in the author document
            else if (author && author.avatarUrl) {
              authorImageUrl = author.avatarUrl;
            }
            // Finally, check if post has authorAvatar
            else if (post.authorAvatar) {
              authorImageUrl = post.authorAvatar;
            }
          } catch (error) {
            console.error('Error accessing author avatar:', error);
          }
          
          return (
            <Link 
              key={post.$id}
              href={`/blog/${post.$id}/${post.slug}`}
              className="block group"
            >
              <article className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[21/9] relative">
                  <Image
                    src={post.bannerImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  
                  {!post.published && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Draft
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-primary/10">
                      {authorImageUrl ? (
                        <Image
                          src={authorImageUrl}
                          alt={author?.name || post.authorName || 'Author'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-primary font-medium">
                          {author?.name?.charAt(0) || post.authorName?.charAt(0) || 'A'}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <p className="font-medium">{author?.name || post.authorName || 'Anonymous'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="line-clamp-3 text-muted-foreground mb-4">
                    {post.excerpt || post.content.substring(0, 200).replace(/<[^>]*>/g, '')}...
                  </div>
                  
                  <span className="text-primary font-medium group-hover:underline">
                    Read more →
                  </span>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 