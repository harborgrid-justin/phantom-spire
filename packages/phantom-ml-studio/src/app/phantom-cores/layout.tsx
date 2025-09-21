import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phantom Cores Dashboard | ML Studio',
  description: 'Unified enterprise cybersecurity and ML management dashboard for all phantom-*-core modules',
  keywords: ['cybersecurity', 'machine learning', 'XDR', 'compliance', 'enterprise security', 'threat detection'],
};

export default function PhantomCoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}