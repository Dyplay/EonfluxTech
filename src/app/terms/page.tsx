'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/app/components/TranslationProvider';

export default function TermsOfService() {
  const { t } = useTranslation();
  
  return (
    <div className="container py-12 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing and using Eonflux Technologies' website and services, you agree to be bound by these Terms of Service 
              and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from 
              using or accessing our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily access and use our software, website, and services for personal, 
              non-commercial purposes. This license does not include:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Modifying or copying our materials</li>
              <li>Using materials for commercial purposes</li>
              <li>Attempting to decompile or reverse engineer any software</li>
              <li>Removing any copyright or proprietary notations</li>
              <li>Transferring the materials to another person</li>
            </ul>
            <p>This license shall automatically terminate if you violate any of these restrictions.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Open Source Software</h2>
            <p>
              Some of our software is released under open source licenses. Use of such software is governed by their 
              respective licenses. Where applicable, the terms of those licenses shall take precedence over these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Accounts</h2>
            <p>
              When you create an account with us, you must provide accurate and complete information. You are responsible 
              for maintaining the security of your account and password. Eonflux Technologies cannot and will not be liable 
              for any loss or damage from your failure to comply with this security obligation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Service Availability</h2>
            <p>
              We strive to provide our services 24/7, but we do not guarantee that our services will be available at all times. 
              We reserve the right to modify, suspend, or discontinue any part of our services without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p>
              The website, services, and their original content (excluding content provided by users and open source software) 
              remain the sole property of Eonflux Technologies. Our trademarks and trade dress may not be used in connection 
              with any product or service without our prior written consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. User Content</h2>
            <p>
              Users may post content as long as it isn't illegal, obscene, threatening, defamatory, invasive of privacy, 
              infringing of intellectual property rights, or otherwise injurious to third parties. We reserve the right to 
              remove or modify user content at our discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p>
              Eonflux Technologies shall not be liable for any direct, indirect, incidental, special, consequential, or 
              punitive damages resulting from your use or inability to use our services. This includes damages for loss of 
              profits, goodwill, use, data, or other intangible losses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of Austria, without regard to its 
              conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any changes by updating the 
              "Last Updated" date of these terms.
            </p>
            <p className="mt-4">
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="mt-2">
              Email: legal@eonfluxtech.com
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
} 