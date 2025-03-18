import Image from 'next/image';
import { notFound } from 'next/navigation';
import { databases } from '@/lib/appwrite';
import { BlogPost, Author } from '@/lib/types';
import { Metadata } from 'next';

interface BlogPostPageProps {
  params: {
    id: string;
    slug: string;
  };
}

async function getBlogPost(id: string): Promise<BlogPost | null> {
  try {
    const response = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID!,
      'blogs',
      id
    );
    return response as BlogPost;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

async function getAuthor(authorId: string): Promise<Author | null> {
  try {
    const response = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID!,
      'users',
      authorId
    );
    return response as Author;
  } catch (error) {
    console.error('Error fetching author:', error);
    return null;
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.id);
  
  if (!post) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.'
    };
  }

  return {
    title: `${post.title} | EonfluxTech Blog`,
    description: post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.content.substring(0, 160),
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
  const post = await getBlogPost(params.id);
  
  if (!post || post.slug !== params.slug) {
    notFound();
  }
  
  const author = await getAuthor(post.authorId);

  return (
    <article className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="aspect-[21/9] relative rounded-lg overflow-hidden mb-8">
          <Image
            src={post.bannerImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <h1 className="text-4xl font-bold mb-6">{post.title}</h1>

        <div className="flex items-center gap-3 mb-8 border-b border-border pb-6">
          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-primary/10">
            {author?.avatarUrl ? (
              <Image
                src={author.avatarUrl}
                alt={author.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-primary font-medium text-lg">
                {author?.name.charAt(0)}
              </div>
            )}
          </div>
          
          <div>
            <p className="font-medium">{author?.name}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {post.content}
        </div>
      </div>
    </article>
  );
} 