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
  const auth = useAuth();
  const user = auth?.user;

  // Check if user has already liked the post
  useEffect(() => {
    const checkIfLiked = async () => {
      if (!user) return;
      
      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'post_likes',
          [
            Query.equal('userId', user.$id),
            Query.equal('postId', postId)
          ]
        );
        setIsLiked(response.documents.length > 0);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    if (user) {
      checkIfLiked();
    }
  }, [user, postId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLiked) {
        // Find and remove like
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'post_likes',
          [
            Query.equal('userId', user.$id),
            Query.equal('postId', postId)
          ]
        );
        
        if (response.documents.length > 0) {
          await databases.deleteDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            'post_likes',
            response.documents[0].$id
          );
          
          const newCount = likeCount - 1;
          setLikeCount(newCount);
          
          // Update post likes count
          await databases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            'blogs',
            postId,
            { likes: newCount }
          );
          
          setIsLiked(false);
          toast.success('Post unliked');
        }
      } else {
        // Add like
        await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'post_likes',
          ID.unique(),
          {
            userId: user.$id,
            postId,
            likedAt: new Date().toISOString()
          }
        );
        
        const newCount = likeCount + 1;
        setLikeCount(newCount);
        
        // Update post likes count
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'blogs',
          postId,
          { likes: newCount }
        );
        
        setIsLiked(true);
        toast.success('Post liked');
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast.error(isLiked ? 'Failed to unlike post' : 'Failed to like post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`relative p-2 rounded-full transition-colors flex items-center gap-1 ${
        isLiked ? 'text-red-500 bg-red-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
      }`}
      aria-label={isLiked ? 'Unlike post' : 'Like post'}
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
  );
} 