'use client';

import { useEffect } from 'react';
import Prism from 'prismjs';

// Import a small subset of commonly used languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';

// Import theme CSS (already imported in page.tsx, but including here for component independence)
// import 'prismjs/themes/prism-tomorrow.css';

// Component to initialize Prism.js
const CodeHighlighter = () => {
  useEffect(() => {
    // Highlight all code blocks on mount and when content changes
    if (typeof window !== 'undefined') {
      Prism.highlightAll();
    }
  }, []);

  return null;
};

// Function to manually trigger highlighting
export const highlightCode = () => {
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      Prism.highlightAll();
    }, 0);
  }
};

export default CodeHighlighter; 