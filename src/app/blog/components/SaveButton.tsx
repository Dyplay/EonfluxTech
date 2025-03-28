'use client';

import { useState, useEffect } from 'react';
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBookmark } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SaveButtonProps {
  postId: string;
  postTitle: string;
  postSlug: string;
  postBannerImage: string;
  postExcerpt?: string;
}

export function SaveButton({ postId, postTitle, postSlug, postBannerImage, postExcerpt }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const user = auth?.user;

  // Check if post is already saved when component mounts
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user) return;
      
      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'saved_posts',
          [
            Query.equal('userId', user.$id),
            Query.equal('postId', postId)
          ]
        );
        setIsSaved(response.documents.length > 0);
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };

    if (user) {
      checkIfSaved();
    }
  }, [user, postId]);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to save posts');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isSaved) {
        // Remove saved post
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'saved_posts',
          [
            Query.equal('userId', user.$id),
            Query.equal('postId', postId)
          ]
        );
        
        if (response.documents.length > 0) {
          await databases.deleteDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            'saved_posts',
            response.documents[0].$id
          );
          setIsSaved(false);
          toast.success('Post removed from saved');
        }
      } else {
        // Save the post
        await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'saved_posts',
          ID.unique(),
          {
            userId: user.$id,
            postId,
            postTitle,
            postSlug,
            postBannerImage,
            postExcerpt,
            savedAt: new Date().toISOString()
          }
        );
        setIsSaved(true);
        toast.success('Post saved successfully');
      }
    } catch (error) {
      console.error('Error handling save:', error);
      toast.error(isSaved ? 'Failed to remove post from saved' : 'Failed to save post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isLoading}
      className={`relative p-2 rounded-full transition-colors ${
        isSaved ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-primary hover:bg-primary/10'
      }`}
      aria-label={isSaved ? 'Unsave post' : 'Save post'}
    >
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20"
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>
      
      <motion.div
        animate={isSaved ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <FiBookmark
          className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`}
        />
      </motion.div>
    </button>
  );
} 