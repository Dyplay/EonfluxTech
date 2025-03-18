'use client';

import { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { FiMail, FiUser, FiMessageSquare, FiFileText, FiCheck } from 'react-icons/fi';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      toast.success('Message sent successfully!');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setIsSuccess(true);
      
      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-foreground text-6xl font-bold mb-4">Contact Us</h1>
          <p className="text-foreground text-xl text-center mx-auto max-w-2xl">
            Have a question or want to work together? We'd love to hear from you.
          </p>
        </div>

        <div className="card hover:scale-100">
          <div className="p-6 sm:p-10">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  {/* Outer ring animation */}
                  <div className="absolute inset-0 animate-[ping_1s_ease-in-out]">
                    <div className="w-24 h-24 rounded-full bg-primary/20" />
                  </div>
                  {/* Inner circle with checkmark */}
                  <div className="relative w-24 h-24 rounded-full bg-primary flex items-center justify-center animate-[bounce_0.5s_ease-in-out]">
                    <FiCheck className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h2 className="mt-8 text-2xl font-semibold text-foreground">
                  Thank you for your message!
                </h2>
                <p className="mt-2 text-secondary">
                  We'll get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label
                      htmlFor="name"
                      className="flex items-center text-sm font-medium text-foreground mb-2"
                    >
                      <FiUser className="w-4 h-4 mr-2" />
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150 ease-in-out"
                      placeholder="Your name"
                    />
                  </div>

                  <div className="relative">
                    <label
                      htmlFor="email"
                      className="flex items-center text-sm font-medium text-foreground mb-2"
                    >
                      <FiMail className="w-4 h-4 mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150 ease-in-out"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label
                    htmlFor="subject"
                    className="flex items-center text-sm font-medium text-foreground mb-2"
                  >
                    <FiFileText className="w-4 h-4 mr-2" />
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150 ease-in-out"
                    placeholder="What's this about?"
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor="message"
                    className="flex items-center text-sm font-medium text-foreground mb-2"
                  >
                    <FiMessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150 ease-in-out resize-none"
                    placeholder="Your message here..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 