'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { account } from '@/lib/appwrite';
import { getGumroadProduct } from '@/lib/gumroad';

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
  content: string[];
  custom_fields: {
    name: string;
    required: boolean;
  }[];
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

    // Function to check if URL indicates success
    const isSuccessUrl = (url: string) => {
      const successPatterns = [
        'gumroad.com/d/',
        '/thank_you',
        '/success',
        '/download',
        'gumroad.com/receipts/'
      ];
      return successPatterns.some(pattern => url.includes(pattern));
    };

    // Check popup URL and status periodically
    const checkPopup = setInterval(() => {
      // Check if window is closed
      if (checkoutWindow.closed) {
        clearInterval(checkPopup);
        if (status === 'processing') {
          onClose();
        }
        return;
      }

      try {
        // Try to access the URL (this will throw if cross-origin)
        const currentUrl = checkoutWindow.location.href;
        
        // Skip if still on about:blank
        if (currentUrl === 'about:blank') {
          return;
        }

        // Check for success URL patterns
        if (isSuccessUrl(currentUrl)) {
          clearInterval(checkPopup);
          setStatus('completed');
          setTimeout(() => {
            checkoutWindow.close();
          }, 500);
        }
      } catch (error) {
        // Ignore cross-origin errors
      }
    }, 500);

    // Handle window closing
    const handleBeforeUnload = () => {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      clearInterval(checkPopup);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, [checkoutUrl, onClose, status]);

  // Auto-close after showing completion for 2 seconds
  useEffect(() => {
    if (status === 'completed') {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Blurred background */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => {
          if (status === 'processing') {
            onClose();
          }
        }}
      />
      
      {/* Modal content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
      >
        <div className="text-center">
          {status === 'processing' ? (
            <>
              <div className="mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
              <h3 className="text-lg font-medium mb-2">
                Checkout in Progress
              </h3>
              <p className="text-muted-foreground mb-4">
                Complete your purchase in the popup window. This window will close automatically when you're done.
              </p>
              <button
                onClick={() => {
                  if (popupRef.current && !popupRef.current.closed) {
                    popupRef.current.close();
                  }
                  onClose();
                }}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              >
                Cancel Checkout
              </button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">
                Checkout Completed!
              </h3>
              <p className="text-muted-foreground mb-4">
                Thank you for your purchase! You'll receive an email with your product details shortly.
              </p>
              <div className="text-sm text-muted-foreground">
                This window will close automatically...
              </div>
            </>
          )}
        </div>
      </motion.div>
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

        const currentUser = await account.get();
        const productData = await getGumroadProduct(currentUser.$id, params.productId);
        setProduct(productData);
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
    const productPermalink = product!.short_url.split('/l/')[1];
    const url = `https://gumroad.com/checkout?product=${productPermalink}&quantity=1&referrer=${encodeURIComponent(window.location.href)}`;
    setCheckoutUrl(url);
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container max-w-6xl py-8"
      >
        <button
          onClick={() => router.push('/shop')}
          className="mb-8 flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            className="h-5 w-5 mr-2"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <Image
              src={product.thumbnail_url || product.preview_url || '/placeholder-product.png'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-2xl font-medium mb-6">{product.formatted_price}</p>
            
            <div className="prose dark:prose-invert mb-8">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <div 
                className="text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>

            {product.content && product.content.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">What's Included</h2>
                <ul className="space-y-2">
                  {product.content.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.custom_fields && product.custom_fields.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
                <ul className="space-y-2">
                  {product.custom_fields.map((field, index) => (
                    <li key={index} className="flex items-center">
                      <span className="font-medium mr-2">{field.name}:</span>
                      <span className="text-muted-foreground">
                        {field.required ? 'Required' : 'Optional'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleCheckout}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Buy on Gumroad
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