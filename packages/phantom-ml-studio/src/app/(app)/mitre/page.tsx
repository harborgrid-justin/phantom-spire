/**
 * MITRE ATT&CK Framework Page
 * Main page for accessing MITRE data and functionality
 */
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamic import to ensure client-side rendering
const MitreDashboard = dynamic(
  () => import('@/shared/ui/mitre/MitreDashboard'),
  { 
    ssr: false,
    loading: () => <div>Loading MITRE Dashboard...</div>
  }
);

export const metadata: Metadata = {
  title: 'MITRE ATT&CK Framework - Phantom ML Studio',
  description: 'Complete MITRE ATT&CK framework integration with threat analysis, technique mapping, and cross-correlation capabilities.',
  keywords: ['MITRE', 'ATT&CK', 'threat analysis', 'cybersecurity', 'technique mapping', 'framework']
};

export default function MitrePage() {
  return <MitreDashboard />;
}