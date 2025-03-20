import { Suspense } from 'react';
import ManageBlogContent from './ManageBlogContent';
import Loading from '../../loading';

export const dynamic = 'force-dynamic';

export default function ManageBlogPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ManageBlogContent />
    </Suspense>
  );
} 