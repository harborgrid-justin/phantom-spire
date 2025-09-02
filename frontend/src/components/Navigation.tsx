'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/threat-intelligence', label: 'Threat Intelligence', icon: '🛡️' },
  { href: '/ioc', label: 'IOCs', icon: '🔍' },
  { href: '/incidents', label: 'Incidents', icon: '🚨' },
  { href: '/mitre', label: 'MITRE ATT&CK', icon: '🎯' },
  { href: '/issues', label: 'Issues', icon: '⚠️' },
  { href: '/organizations', label: 'Organizations', icon: '🏢' },
  { href: '/evidence', label: 'Evidence', icon: '📁' },
  { href: '/tasks', label: 'Tasks', icon: '📋' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-blue-400">
              Phantom Spire CTI
            </Link>
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-300">
              Status: <span className="text-green-400">Online</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
