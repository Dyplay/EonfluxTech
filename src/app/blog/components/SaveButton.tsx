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
  const [saveDocId, setSaveDocId] = useState<string | null>(null);
  const auth = useAuth();
  const user = auth?.user || null;
  const loading = auth?.loading !== undefined ? auth.loading : true;

  // Check if post is already saved when component mounts or user changes
  useEffect(() => {
    async function checkSaveStatus() {
      if (!user) {
        setIsSaved(false);
        return;
      }

      console.log("Checking save status for user:", user.$id, "and post:", postId);
      
      try {
        console.log("Database ID:", process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'saved_posts',
          [
            Query.equal('userId', user.$id),
            Query.equal('postId', postId)
          ]
        );

        console.log("Save status response:", response);
        
        if (response.documents.length > 0) {
          console.log("Post is saved, doc ID:", response.documents[0].$id);
          setIsSaved(true);
          setSaveDocId(response.documents[0].$id);
        } else {
          console.log("Post is not saved");
          setIsSaved(false);
          setSaveDocId(null);
        }
      } catch (error) {
        console.error('Error checking save status:', error);
      }
    }

    console.log("Auth state:", { user, loading });
    
    if (!loading) {
      checkSaveStatus();
    }
  }, [user, loading, postId]);

  const handleSave = async () => {
    if (!user) {
      toast.error('Please login to save posts');
      return;
    }

    setIsLoading(true);

    try {
      if (isSaved && saveDocId) {
        // Unsave post
        await databases.deleteDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'saved_posts',
          saveDocId
        );

        setIsSaved(false);
        setSaveDocId(null);
        toast.success('Post removed from saved');
      } else {
        // Save post
        const newSave = await databases.createDocument(
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
        setSaveDocId(newSave.$id);
        toast.success('Post saved successfully');
      }
    } catch (error) {
      console.error('Error updating saved status:', error);
      toast.error('Failed to update saved status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isLoading || loading || !user}
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