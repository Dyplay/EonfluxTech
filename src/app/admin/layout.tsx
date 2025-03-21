import AdminAccessCheck from './components/AdminAccessCheck';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAccessCheck>
      {children}
    </AdminAccessCheck>
  );
} 