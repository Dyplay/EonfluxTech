'use client';

import { useState, useEffect } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiBookmark, FiClock } from 'react-icons/fi';
import type { SavedPost } from '@/lib/types';

export function SavedPosts({ userId }: { userId: string }) {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = () => {
      setIsLoading(true);
      databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'saved_posts',
        [
          Query.equal('userId', userId),
          Query.orderDesc('savedAt')
        ]
      )
      .then(response => {
        setSavedPosts(response.documents as unknown as SavedPost[]);
      })
      .catch(error => {
        console.error('Error fetching saved posts:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
    };

    if (userId) {
      fetchSavedPosts();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[16/9] bg-card rounded-t-lg"></div>
            <div className="p-4 space-y-3 bg-card rounded-b-lg">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (savedPosts.length === 0) {
    return (
      <div className="text-center py-12 bg-accent/30 rounded-lg border border-border">
        <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <FiBookmark className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-foreground text-xl font-semibold mb-2">No saved posts yet</h3>
        <p className="text-secondary max-w-md mx-auto">
          Start saving interesting posts to read them later!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {savedPosts.map((saved, index) => (
        <motion.div
          key={saved.$id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group"
        >
          <Link href={`/blog/${saved.postId}/${saved.postSlug}`}>
            <article className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="aspect-[16/9] relative">
                <Image
                  src={saved.postBannerImage}
                  alt={saved.postTitle}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {saved.postTitle}
                </h3>
                {saved.postExcerpt && (
                  <p className="text-secondary text-sm line-clamp-2 mb-3">
                    {saved.postExcerpt}
                  </p>
                )}
                <div className="flex items-center text-sm text-secondary">
                  <FiClock className="w-4 h-4 mr-1" />
                  {new Date(saved.savedAt).toLocaleDateString()}
                </div>
              </div>
            </article>
          </Link>
        </motion.div>
      ))}
    </div>
  );
} 