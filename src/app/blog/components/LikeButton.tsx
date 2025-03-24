'use client';

import { useState, useEffect } from 'react';
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
}

export function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLoading, setIsLoading] = useState(false);
  const [likeDocId, setLikeDocId] = useState<string | null>(null);
  const auth = useAuth();

  // Force refresh auth when the component mounts
  useEffect(() => {
    if (auth.checkAuth) {
      auth.checkAuth();
    }
  }, []);

  // Check if post is already liked when component mounts or user changes
  useEffect(() => {
    async function checkLikeStatus() {
      if (!auth.user) {
        setIsLiked(false);
        return;
      }

      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'post_likes',
          [
            Query.equal('userId', auth.user.$id),
            Query.equal('postId', postId)
          ]
        );
        
        if (response.documents.length > 0) {
          setIsLiked(true);
          setLikeDocId(response.documents[0].$id);
        } else {
          setIsLiked(false);
          setLikeDocId(null);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    }
    
    if (!auth.loading) {
      checkLikeStatus();
    }
  }, [auth.user, auth.loading, postId]);

  const handleLike = async () => {
    if (!auth.user) {
      toast.error('Please login to like posts');
      return;
    }

    setIsLoading(true);

    try {
      if (isLiked && likeDocId) {
        // Unlike post
        await databases.deleteDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'post_likes',
          likeDocId
        );

        // Update post likes count in the blogs collection
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'blogs',
          postId,
          { likes: likeCount - 1 }
        );

        setLikeCount(prev => prev - 1);
        setIsLiked(false);
        setLikeDocId(null);
        toast.success('Post unliked');
      } else {
        // Like post
        const newLike = await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'post_likes',
          ID.unique(),
          {
            userId: auth.user.$id,
            postId,
            likedAt: new Date().toISOString()
          }
        );

        // Update post likes count in the blogs collection
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'blogs',
          postId,
          { likes: likeCount + 1 }
        );

        setLikeCount(prev => prev + 1);
        setIsLiked(true);
        setLikeDocId(newLike.$id);
        toast.success('Post liked');
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative pointer-events-none">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("Like button clicked!");
          handleLike();
        }}
        disabled={isLoading || auth.loading || !auth.user}
        className={`relative p-2 rounded-full transition-colors flex items-center gap-1 ${
          isLiked ? 'text-red-500 bg-red-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
        } cursor-pointer z-10 pointer-events-auto`}
        aria-label={isLiked ? 'Unlike post' : 'Like post'}
        type="button"
      >
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="absolute inset-0 rounded-full bg-red-500/20"
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>
        
        <motion.div
          animate={isLiked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <FiHeart
            className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
          />
        </motion.div>
        <span className="text-sm">{likeCount}</span>
      </button>
    </div>
  );
} 