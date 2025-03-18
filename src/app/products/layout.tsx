import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Products | EonfluxTech',
  description: 'Explore our open-source products and repositories from EonfluxTech',
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 