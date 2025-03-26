'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { databases, storage } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { useAuth } from '@/hooks/useAuth';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { FiImage, FiEdit3, FiX, FiEye, FiSave, FiArrowLeft } from 'react-icons/fi';
import DOMPurify from 'isomorphic-dompurify';
import BlogAdminNav from '@/app/components/admin/BlogAdminNav';

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

export default function NewBlogPostPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      console.log('Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }
    
    if (user && !authLoading) {
      // Check if user has admin role
      const userRole = user.prefs?.role || 'user';
      if (userRole !== 'admin') {
        console.log('User is not an admin, redirecting to home');
        toast.error('You do not have permission to create blog posts');
        router.push('/');
        return;
      }
    }
  }, [user, authLoading, router]);



  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setBannerImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setBannerImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setBannerImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim() !== '') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to create a post');
      return;
    }

    if (!title || !content || (!bannerImage && !previewUrl)) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading('Creating blog post...');

      let imageUrl = previewUrl;
      let imageChanged = false;

      // Upload new banner image if changed
      if (bannerImage) {
        // Delete old image if it exists
        if (previewUrl) {
          try {
            // Extract file ID from the URL
            const url = new URL(previewUrl);
            const pathParts = url.pathname.split('/');
            const fileId = pathParts[pathParts.length - 1];
            
            await storage.deleteFile(
              process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
              fileId
            );
          } catch (error) {
            console.error('Error deleting old image:', error);
            // Continue even if old image deletion fails
          }
        }

        // Upload new image
        const fileUpload = await storage.createFile(
          process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
          ID.unique(),
          bannerImage
        );

        imageUrl = storage.getFileView(
          process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
          fileUpload.$id
        ).toString();
        imageChanged = true;
      }

      // Define the interface for document data
      interface BlogDocumentData {
        title: string;
        slug: string;
        content: string;
        excerpt: string;
        bannerImage: string;
        published: boolean;
        createdAt: string;
        updatedAt: string;
        authorId: string;
        authorName: string;
        authorAvatar?: string;
        tags?: string;
        likes: number;
        views: number;
      }

      // Create new post data
      const postData: BlogDocumentData = {
        title,
        slug: createSlug(title),
        content,
        excerpt: excerpt || content.substring(0, 150).replace(/<[^>]*>/g, '') + '...',
        bannerImage: imageUrl || '',
        published: isPublished,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        authorId: user.$id,
        authorName: user.name,
        likes: 0,
        views: 0
      };

      // Add the author's avatar URL if available
      if (user.prefs?.avatar) {
        postData.authorAvatar = user.prefs.avatar;
      }

      // Only add tags if there are any, as a comma-separated string
      if (tags && tags.length > 0) {
        try {
          postData.tags = tags.join(',');
        } catch (e) {
          console.warn('Could not add tags:', e);
        }
      }

      // Create new blog post
      const newPost = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'blogs',
        ID.unique(),
        postData
      );

      toast.success('Blog post created successfully!');
      if (isPublished) {
        router.push(`/blog/${newPost.$id}/${newPost.slug}`);
      } else {
        router.push('/panel/blog/manage');
      }
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast.error('Failed to create blog post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const PreviewMode = () => (
    <div className="space-y-8">
      {previewUrl && (
        <div className="relative aspect-[21/9] w-full rounded-lg overflow-hidden">
          <img
            src={previewUrl}
            alt="Banner Preview"
            className="object-cover w-full h-full"
          />
        </div>
      )}
      
      <h1 className="text-4xl font-bold">{title || 'Untitled Blog Post'}</h1>
      
      {tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <span key={tag} className="px-3 py-1 bg-primary/10 rounded-full text-primary text-sm">
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="prose dark:prose-invert max-w-none">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
        ) : (
          <p className="text-secondary italic">No content yet</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/panel/blog/manage')}
              className="p-2 rounded-full hover:bg-accent transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-foreground text-3xl font-bold">
              {isPreviewMode ? 'Preview Blog Post' : 'Create New Blog Post'}
            </h1>
          </div>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="btn bg-accent hover:bg-accent/80 flex items-center gap-2"
            >
              {isPreviewMode ? (
                <>
                  <FiEdit3 className="w-4 h-4" />
                  Edit
                </>
              ) : (
                <>
                  <FiEye className="w-4 h-4" />
                  Preview
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !title || !content || !bannerImage}
              className="btn btn-primary flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  {isPublished ? 'Create & Publish' : 'Save as Draft'}
                </>
              )}
            </button>
          </div>
        </div>

        <BlogAdminNav />

        {isPreviewMode ? (
          <PreviewMode />
        ) : (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Banner Image <span className="text-red-500">*</span>
              </label>
              <div 
                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-accent/50 hover:bg-accent transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="banner-image"
                />
                
                {previewUrl ? (
                  <div className="relative w-full aspect-[21/9] rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background/90 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <FiImage className="w-12 h-12 mx-auto text-secondary mb-4" />
                    <p className="font-medium">Drag and drop an image here, or click to browse</p>
                    <p className="text-sm text-secondary mt-2">
                      Recommended size: 1920x1080px. Max size: 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150 ease-in-out"
                placeholder="Enter a catchy title for your blog post"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-4 py-3 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150 ease-in-out"
                placeholder="Write a short description (optional)"
                rows={3}
              />
              <p className="mt-1 text-sm text-secondary">
                Leave empty to auto-generate from content
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full"
                  >
                    <span className="text-sm text-primary">{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-primary hover:text-primary/80"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                className="w-full px-4 py-3 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150 ease-in-out"
                placeholder="Add tags (press Enter or comma to add)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <div className="prose dark:prose-invert w-full max-w-none">
                <Editor
                  value={content}
                  onChange={setContent}
                  className="min-h-[400px]"
                />
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-secondary/30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="ms-3 text-sm font-medium text-foreground">
                  {isPublished ? 'Published' : 'Draft'}
                </span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 