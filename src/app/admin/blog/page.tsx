import { Suspense } from 'react';
import AdminBlogContent from './AdminBlogContent';
import Loading from '../loading';

export const dynamic = 'force-dynamic';

export default function AdminBlogPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminBlogContent />
    </Suspense>
  );
}