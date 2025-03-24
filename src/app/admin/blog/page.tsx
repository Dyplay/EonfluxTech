import { Suspense } from 'react';
import AdminBlogContent from './AdminBlogContent';

export const dynamic = 'force-dynamic';

export default function AdminBlogPage() {
  return (
      <Suspense fallback={<div>Loading...</div>}>
        <AdminBlogContent />
      </Suspense>
  );
}