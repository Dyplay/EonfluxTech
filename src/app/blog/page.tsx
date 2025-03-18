import Link from 'next/link';
import Image from 'next/image';
import { databases } from '@/lib/appwrite';
import { BlogPost, Author } from '@/lib/types';
import { Query } from 'appwrite';

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      'blogs',
      [
        Query.orderDesc('createdAt'),
      ]
    );
    return response.documents as BlogPost[];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
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

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      
      <div className="grid gap-8">
        {posts.map(async (post) => {
          const author = await getAuthor(post.authorId);
          
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
                </div>
                
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-primary/10">
                      {author?.avatarUrl ? (
                        <Image
                          src={author.avatarUrl}
                          alt={author.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-primary font-medium">
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
                  
                  <div className="line-clamp-3 text-muted-foreground mb-4">
                    {post.content.substring(0, 200)}...
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