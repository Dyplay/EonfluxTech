'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { databases, storage } from '@/lib/appwrite';
import { Query, Models } from 'appwrite';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  FiPlus, FiEdit2, FiTrash2, FiEye, FiArrowLeft, 
  FiCheck, FiX, FiFilter, FiSearch
} from 'react-icons/fi';
import BlogAdminNav from '@/app/components/admin/BlogAdminNav';

interface BlogPost extends Models.Document {
  title: string;
  slug: string;
  content: string;
  published: boolean;
}

export default function ManageBlogContent() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchPosts = async () => {
      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'blogs'
        );
        setPosts(response.documents as BlogPost[]);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to fetch posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [user, router, authLoading]);

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'blogs',
        postId
      );
      setPosts(posts.filter(post => post.$id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container py-8">
      <BlogAdminNav />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Blog Posts</h1>
        <Link 
          href="/admin/blog"
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus /> New Post
        </Link>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <div 
            key={post.$id}
            className="bg-card p-4 rounded-lg border border-border flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{post.title}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(post.$createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                href={`/blog/${post.$id}/${post.slug}`}
                className="btn btn-ghost"
                target="_blank"
              >
                <FiEye />
              </Link>
              <Link
                href={`/admin/blog/edit/${post.$id}`}
                className="btn btn-ghost"
              >
                <FiEdit2 />
              </Link>
              <button
                onClick={() => handleDelete(post.$id)}
                className="btn btn-ghost text-red-500"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12 bg-accent/30 rounded-lg">
            <p className="text-muted-foreground">No posts found</p>
            <Link 
              href="/admin/blog"
              className="btn btn-primary mt-4"
            >
              Create your first post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 