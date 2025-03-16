'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { account } from '@/lib/appwrite';
import { getGumroadProducts } from '@/lib/gumroad';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  formatted_price: string;
  thumbnail_url: string | null;
  preview_url: string | null;
  url: string | null;
  short_url: string;
  sales_count?: number;
  custom_permalink?: string;
  custom_summary?: string;
  published: boolean;
}

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const currentUser = await account.get();
        const productsData = await getGumroadProducts(currentUser.$id);
        console.log('Gumroad API Response:', {
          products: productsData,
          count: productsData?.length || 0,
          timestamp: new Date().toISOString()
        });
        setProducts(productsData.map(product => ({
          ...product,
          short_url: `https://gumroad.com/l/${product.custom_permalink || product.id}`
        })));
      } catch (err: any) {
        console.error('Error loading products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleProductClick = (productId: string) => {
    router.push(`/shop/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 text-center">
          <div className="mb-4 text-destructive">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Failed to Load Products</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-8">Shop</h1>
      
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="aspect-video relative">
                <Image
                  src={product.thumbnail_url || product.preview_url || '/placeholder-product.png'}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <button
                  className="absolute bottom-4 right-4 px-4 py-2 bg-primary text-primary-foreground rounded-md opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/shop/${product.id}`);
                  }}
                >
                  Buy Now
                </button>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1 flex-1 mr-2">
                    {product.name}
                  </h3>
                  <span className="font-medium text-lg text-primary">
                    {product.formatted_price}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {product.custom_summary || product.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    {product.sales_count} sales
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    Popular
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 