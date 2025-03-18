export interface BlogPost {
  $id: string;
  title: string;
  slug: string;
  content: string;
  bannerImage: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
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