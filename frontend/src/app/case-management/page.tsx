'use client';

import { useState } from 'react';
import Link from 'next/link';
import { caseManagementNavigation } from './index';

interface CaseManagementDashboardProps {
  className?: string;
}

export default function CaseManagementDashboard({ className = '' }: CaseManagementDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter pages based on category and search
  const filteredPages = caseManagementNavigation.filter(page => {
    const matchesCategory = selectedCategory === 'all' || page.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(caseManagementNavigation.map(page => page.category)))];

  // Group pages by category for better organization
  const pagesByCategory = filteredPages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = [];
    }
    acc[page.category].push(page);
    return acc;
  }, {} as Record<string, typeof caseManagementNavigation>);

  return (
    <div className={`min-h-screen bg-gray-50 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Case Management System</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive case management platform with 40 specialized modules
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{caseManagementNavigation.length}</div>
              <div className="text-sm text-gray-500">Total Modules</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search case management modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {pagesByCategory.lifecycle?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Lifecycle</div>
              <div className="text-xl">🔄</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {pagesByCategory.evidence?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Evidence</div>
              <div className="text-xl">🔍</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {pagesByCategory.workflows?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Workflows</div>
              <div className="text-xl">⚡</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {pagesByCategory.analytics?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Analytics</div>
              <div className="text-xl">📊</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {pagesByCategory.compliance?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Compliance</div>
              <div className="text-xl">✅</div>
            </div>
          </div>
        </div>

        {/* Pages Grid */}
        {selectedCategory === 'all' ? (
          // Show all categories with headers
          Object.entries(pagesByCategory).map(([category, pages]) => (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">
                {category} ({pages.length} modules)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map((page) => (
                  <Link key={page.path} href={page.path}>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
                      <div className="flex items-start space-x-4">
                        <div className="text-2xl group-hover:scale-110 transition-transform">
                          {page.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {page.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{page.description}</p>
                          <div className="flex items-center mt-3">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {page.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        ) : (
          // Show selected category only
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPages.map((page) => (
              <Link key={page.path} href={page.path}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl group-hover:scale-110 transition-transform">
                      {page.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {page.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{page.description}</p>
                      <div className="flex items-center mt-3">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {page.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filteredPages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium">No modules found</h3>
              <p className="text-sm">Try adjusting your search or filter criteria.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}