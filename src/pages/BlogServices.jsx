import React from 'react';
import { Toaster } from 'react-hot-toast';

import BlogHero from '../components/blog/BlogHero';
import FeaturedBlog from '../components/blog/FeaturedBlog';

export default function BlogServices() {
  return (
    <div className="max-w-6xl mx-auto pb-20 relative md:mt-15 mt-5">
      <Toaster position="top-right" />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage Blog Hero Section and Featured Blog Section independently.
        </p>
      </div>

      {/* Blog Sections */}
      <div className="space-y-6">
        <BlogHero />
        <FeaturedBlog />
      </div>
    </div>
  );
}
