import Link from 'next/link';
import Image from 'next/image';
import { databases, storage } from '@/lib/appwrite';
import { BlogPost, Author } from '@/lib/types';
import { Query } from 'appwrite';
import { cookies } from 'next/headers';
import { FiEdit2 } from 'react-icons/fi';
import { LikeButton } from './components/LikeButton';
import { SaveButton } from './components/SaveButton';

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
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('appwrite_session');
  const isAuthenticated = !!sessionCookie;

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-accent/30 rounded-lg border border-border">
          <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <FiEdit2 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-foreground text-xl font-semibold mb-2">No blog posts yet</h3>
          <p className="text-secondary max-w-md mx-auto">
            There aren't any blog posts at the moment. Check back later!
          </p>
        </div>
      ) : (
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
              <div key={post.$id} className="group">
                <article className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/blog/${post.$id}/${post.slug}`}>
                    <div className="aspect-[21/9] relative">
                      <Image
                        src={post.bannerImage}
                        alt={post.title}
                        width={2100}
                        height={900}
                        className="object-cover w-full h-full"
                        quality={100}
                        priority
                        unoptimized
                      />
                      
                      {!post.published && (
                        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Draft
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Link href={`/blog/${post.$id}/${post.slug}`}>
                        <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">
                          {post.title}
                        </h2>
                      </Link>
                      <div className="flex items-center gap-2">
                        <LikeButton
                          postId={post.$id}
                          initialLikes={post.likes || 0}
                        />
                        <SaveButton
                          postId={post.$id}
                          postTitle={post.title}
                          postSlug={post.slug}
                          postBannerImage={post.bannerImage}
                          postExcerpt={post.excerpt}
                        />
                      </div>
                    </div>
                    
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
                    
                    <Link href={`/blog/${post.$id}/${post.slug}`} className="text-primary font-medium group-hover:underline">
                      Read more →
                    </Link>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 