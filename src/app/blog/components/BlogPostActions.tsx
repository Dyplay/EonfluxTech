'use client';

import { LikeButton } from './LikeButton';
import { SaveButton } from './SaveButton';

interface BlogPostActionsProps {
  postId: string;
  postTitle: string;
  postSlug: string;
  postBannerImage: string;
  postExcerpt?: string;
  initialLikes: number;
}

export function BlogPostActions({ postId, postTitle, postSlug, postBannerImage, postExcerpt, initialLikes }: BlogPostActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <LikeButton
        postId={postId}
        initialLikes={initialLikes}
      />
      <SaveButton
        postId={postId}
        postTitle={postTitle}
        postSlug={postSlug}
        postBannerImage={postBannerImage}
        postExcerpt={postExcerpt}
      />
    </div>
  );
} 