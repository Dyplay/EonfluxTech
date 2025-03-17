'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getGumroadProduct } from '@/lib/gumroad';
import DOMPurify from 'isomorphic-dompurify';

interface ProductPageProps {
  params: {
    productId: string;
  };
}

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
  custom_fields: {
    name: string;
    required: boolean;
  }[];
  custom_permalink?: string;
}

function CheckoutModal({ onClose, checkoutUrl }: { onClose: () => void; checkoutUrl: string }) {
  const [status, setStatus] = useState<'processing' | 'completed'>('processing');
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    // Calculate center position for the popup
    const width = 500;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    // First create the popup with about:blank
    const checkoutWindow = window.open(
      'about:blank',
      'GumroadCheckout',
      `width=${width},height=${height},left=${left},top=${top},toolbar=0,location=0,menubar=0,status=0,scrollbars=1`
    );
    
    // If window was blocked, close modal
    if (!checkoutWindow) {
      onClose();
      return;
    }

    // Store reference to the window
    popupRef.current = checkoutWindow;

    // Then change its location to the checkout URL
    checkoutWindow.location.href = checkoutUrl;

    // Function to check if window is closed
    const checkWindow = setInterval(() => {
      if (popupRef.current?.closed) {
        clearInterval(checkWindow);
        onClose();
      }
    }, 500);

    return () => {
      clearInterval(checkWindow);
      popupRef.current?.close();
    };
  }, [checkoutUrl, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Processing checkout...</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string>('');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const gumroadProduct = await getGumroadProduct(params.productId);
        
        // Transform GumroadProduct into our Product type
        const transformedProduct: Product = {
          id: gumroadProduct.id,
          name: gumroadProduct.name,
          description: gumroadProduct.description,
          price: gumroadProduct.price,
          formatted_price: gumroadProduct.formatted_price,
          thumbnail_url: gumroadProduct.thumbnail_url || null,
          preview_url: gumroadProduct.preview_url || null,
          url: gumroadProduct.url || null,
          short_url: `https://gumroad.com/l/${gumroadProduct.custom_permalink || gumroadProduct.id}`,
          custom_fields: gumroadProduct.custom_fields?.map(field => ({
            name: field.name,
            required: field.required || false
          })) || [],
          custom_permalink: gumroadProduct.custom_permalink
        };

        setProduct(transformedProduct);
      } catch (err: any) {
        console.error('Error loading product:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [params.productId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
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
          <h3 className="text-lg font-medium mb-2">Product Not Found</h3>
          <p className="text-muted-foreground mb-4">{error || 'The requested product could not be found.'}</p>
          <button
            onClick={() => router.push('/shop')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    const url = `https://gumroad.com/checkout?product=${product.id}&quantity=1&referrer=https%3A%2F%2Fgumroad.com%2F`;
    setCheckoutUrl(url);
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <button
          onClick={() => router.push('/shop')}
          className="mb-8 text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Shop
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-card border border-border">
            <Image
              src={product.thumbnail_url || product.preview_url || '/placeholder-product.png'}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">{product.name}</h1>
              <p className="text-3xl font-bold text-primary">{product.formatted_price}</p>
            </div>

            <div className="prose prose-lg dark:prose-invert">
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(product.description)
                }}
              />
            </div>

            {product.custom_fields && product.custom_fields.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Additional Information</h2>
                <div className="bg-card border border-border rounded-lg p-6">
                  <ul className="space-y-4">
                    {product.custom_fields.map((field, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span className="font-medium">{field.name}</span>
                        <span className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full">
                          {field.required ? 'Required' : 'Optional'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <button
              onClick={handleCheckout}
              className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
            >
              <span>Buy Now</span>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutModal
            checkoutUrl={checkoutUrl}
            onClose={() => setIsCheckoutOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
} 