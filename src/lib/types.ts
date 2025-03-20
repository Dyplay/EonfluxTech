export interface BlogPost {
  $id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  bannerImage: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  published?: boolean;
  tags?: string | string[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  likedBy?: string[];
}

export interface Author {
  $id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SavedPost {
  $id: string;
  userId: string;
  postId: string;
  savedAt: string;
  // Reference fields from the original post for quick access
  postTitle: string;
  postSlug: string;
  postBannerImage: string;
  postExcerpt?: string;
} 