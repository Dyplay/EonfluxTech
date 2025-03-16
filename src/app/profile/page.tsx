'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { getCurrentUser, updateProfile, updatePassword } from '@/lib/auth';
import AvatarUpload from '../components/AvatarUpload';
import SessionActivity from '../components/SessionActivity';
import Header from '../components/Header';
import GumroadConnection from '../components/GumroadConnection';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').optional(),
  confirmNewPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
    return false;
  }
  return true;
}, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await getCurrentUser();
      if (data) {
        setUser(data);
        reset({
          name: data.name || '',
          email: data.email || '',
          currentPassword: '',
        });
      }
    };
    loadUser();
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (data.name !== user?.name) {
        const { error: nameError } = await updateProfile(data.name);
        if (nameError) throw new Error(nameError.message);
      }

      if (data.newPassword) {
        const { error: passwordError } = await updatePassword(data.newPassword, data.currentPassword);
        if (passwordError) throw new Error(passwordError.message);
      }

      setSuccess('Profile updated successfully');
      const { data: updatedUser } = await getCurrentUser();
      if (updatedUser) setUser(updatedUser);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpdate = async (url: string) => {
    try {
      const { error } = await updateProfile(user.name, url);
      if (error) throw new Error(error.message);
      
      const { data: updatedUser } = await getCurrentUser();
      if (updatedUser) setUser(updatedUser);
      setSuccess('Profile picture updated successfully');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="container max-w-6xl py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Avatar and Basic Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Profile Picture</h2>
              <p className="text-muted-foreground">
                Update your profile picture
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <AvatarUpload
                currentAvatarUrl={user?.prefs?.avatar}
                userId={user?.$id}
                onAvatarUpdate={handleAvatarUpdate}
              />
              <p className="text-sm text-muted-foreground">
                Click to upload a new photo
              </p>
            </div>
          </div>

          {/* Middle Column - Profile Form */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Account Settings</h2>
              <p className="text-muted-foreground">
                Update your account information and password
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-md bg-destructive/10 text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-md bg-green-500/10 text-green-500 text-sm"
              >
                {success}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="Your name"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="Your email"
                    className="w-full px-3 py-2 border border-input/50 rounded-md bg-muted/50 text-muted-foreground cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="currentPassword" className="text-sm font-medium">
                        Current Password
                      </label>
                      <input
                        {...register('currentPassword')}
                        type="password"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      />
                      {errors.currentPassword && (
                        <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="newPassword" className="text-sm font-medium">
                        New Password (optional)
                      </label>
                      <input
                        {...register('newPassword')}
                        type="password"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      />
                      {errors.newPassword && (
                        <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="confirmNewPassword" className="text-sm font-medium">
                        Confirm New Password
                      </label>
                      <input
                        {...register('confirmNewPassword')}
                        type="password"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      />
                      {errors.confirmNewPassword && (
                        <p className="text-sm text-destructive">{errors.confirmNewPassword.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving changes...
                  </span>
                ) : (
                  'Save changes'
                )}
              </button>
            </form>
          </div>

          {/* Session Activity Section */}
          <div className="md:col-span-3 space-y-6">
            <div className="border-t pt-8">
              <SessionActivity />
            </div>
          </div>
        </div>

        {/* Connected Accounts Section */}
        {user && (
          <div className="mt-8 space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Connected Accounts</h2>
              <p className="text-muted-foreground">
                Manage your connected accounts and integrations
              </p>
            </div>

            <div className="grid gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Gumroad</h3>
                <GumroadConnection userId={user.$id} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
