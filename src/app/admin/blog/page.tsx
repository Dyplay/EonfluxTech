import { Suspense } from 'react';
import AdminBlogContent from './AdminBlogContent';
import AdminAccessCheck from '../components/AdminAccessCheck';

export const dynamic = 'force-dynamic';

export default function AdminBlogPage() {
  return (
    <AdminAccessCheck>
      <Suspense fallback={<div>Loading...</div>}>
        <AdminBlogContent />
      </Suspense>
    </AdminAccessCheck>
  );
}