'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { storage, ID } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userId: string;
  onAvatarUpdate: (url: string) => void;
}

const BUCKET_ID = '67d48be1002a95dd5390';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function AvatarUpload({ currentAvatarUrl, userId, onAvatarUpdate }: AvatarUploadProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload an image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Generate a unique file ID
      const fileId = ID.unique();
      const fileName = `avatar_${userId}_${fileId}`;

      // Upload the file to Appwrite Storage
      await storage.createFile(
        BUCKET_ID,
        fileId,
        file
      );

      // Get the file view URL
      const fileUrl = storage.getFileView(BUCKET_ID, fileId).toString();

      // Update the avatar URL
      await onAvatarUpdate(fileUrl);

      // Refresh the page to update all instances of the avatar
      router.refresh();
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      setError(error.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative w-32 h-32">
        <motion.div
          className="relative w-full h-full rounded-full overflow-hidden cursor-pointer group"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ scale: 1.05 }}
        >
          <Image
            src={currentAvatarUrl || '/default-avatar.png'}
            alt="Profile Avatar"
            fill
            className="object-cover"
            sizes="128px"
            priority
          />
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <span className="text-white text-sm font-medium">Change Photo</span>
            </motion.div>
          )}
          <input
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isUploading}
          />
        </motion.div>
        {isUploading && (
          <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
} 