import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { databases, storage } from '@/lib/appwrite';
import { BlogPost, Author } from '@/lib/types';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { LikeButton } from '../../components/LikeButton';
import { FiArrowLeft } from 'react-icons/fi';
import DOMPurify from 'isomorphic-dompurify';
import { SaveButton } from '../../components/SaveButton';

// Add revalidation
export const revalidate = 0;

interface BlogPostPageProps {
  params: {
    param: string;
    slug: string;
  };
}

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
      const post = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'blogs',
        userId // This is the post.authorId which might also be the post.$id
      );
      
      if (post && post.authorAvatar) {
        return { avatarUrl: post.authorAvatar };
      }
    } catch (error) {
      console.log('No matching post found or no authorAvatar');
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

async function getBlogPost(id: string): Promise<BlogPost | null> {
  try {
    const response = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      'blogs',
      id
    );
    // Cast to unknown first, then to BlogPost to avoid TypeScript error
    return response as unknown as BlogPost;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
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

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.param);
  
  if (!post) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.'
    };
  }

  return {
    title: `${post.title} | EonfluxTech Blog`,
    description: post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, ''),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160).replace(/<[^>]*>/g, ''),
      images: [
        {
          url: post.bannerImage,
          width: 1200,
          height: 630,
          alt: post.title
        }
      ]
    }
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.param);
  
  if (!post || post.slug !== params.slug) {
    notFound();
  }
  
  // Check if post is published or user is authenticated
  if (!post.published) {
    // Check if user is authenticated
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('appwrite_session');
    const isAuthenticated = !!sessionCookie;
    
    if (!isAuthenticated) {
      // Redirect to blog home if not published and not authenticated
      redirect('/blog');
    }
  }
  
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
  
  // Function to parse tags whether they're string or array
  const parseTags = (tags: unknown) => {
    if (!tags) return [];
    
    if (typeof tags === 'string') {
      return tags.split(',').filter(tag => !!tag.trim());
    }
    
    if (Array.isArray(tags)) {
      return tags;
    }
    
    return [];
  };

  const postTags = parseTags(post.tags);

  return (
    <article className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link 
            href="/blog"
            className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Blog</span>
          </Link>
        </div>
      
        <div className="aspect-[21/9] relative rounded-lg overflow-hidden mb-8">
          <Image
            src={post.bannerImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          />
          
          {!post.published && (
            <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Draft
            </div>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-6">{post.title}</h1>

        <div className="flex items-center gap-3 mb-8 border-b border-border pb-6">
          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-primary/10">
            {authorImageUrl ? (
              <Image
                src={authorImageUrl}
                alt={author?.name || post.authorName || 'Author'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-primary font-medium text-lg">
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
        <div className='flex items-center gap-3 mb-8 pb-6'>
          <LikeButton
            postId={post.$id}
            initialLikes={post.likes || 0}
            initialLikedByUser={false}
          />
        <SaveButton
          postId={post.$id}
          postTitle={post.title}
          postSlug={post.slug}
          postBannerImage={post.bannerImage}
          postExcerpt={post.excerpt}
          initialSaved={false}
        />
        </div>
        {postTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {postTags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-primary/10 rounded-full text-primary text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div 
          className="prose prose-lg dark:prose-invert max-w-none" 
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />
      </div>
    </article>
  );
} 