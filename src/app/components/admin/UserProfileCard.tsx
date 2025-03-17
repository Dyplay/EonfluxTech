'use client';

import { motion } from 'framer-motion';
import { FiUser, FiMail, FiCheck, FiX, FiLink } from 'react-icons/fi';
import { UserProfile } from '@/lib/admin';

interface UserProfileCardProps {
  userProfile: UserProfile | null;
  loading: boolean;
}

export default function UserProfileCard({ userProfile, loading }: UserProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-lg border border-border p-6 shadow-sm"
    >
      <h3 className="text-lg font-medium mb-4">Logged In User</h3>
      
      {loading ? (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : !userProfile ? (
        <div className="p-4 bg-amber-500/10 text-amber-500 rounded-md">
          <p>Not logged in or unable to fetch user information.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-md">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <FiUser className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{userProfile.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-md">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <FiMail className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{userProfile.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-md">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <FiLink className="h-6 w-6 text-purple-500" />
            </div>
            <div className="flex-grow">
              <p className="text-sm text-muted-foreground">Gumroad Connection</p>
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {userProfile.hasGumroadConnection ? 'Connected' : 'Not Connected'}
                </p>
                {userProfile.hasGumroadConnection ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <FiCheck className="mr-1 h-3 w-3" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    <FiX className="mr-1 h-3 w-3" />
                    Not Connected
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2">
            <p>User ID: {userProfile.id}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
} 