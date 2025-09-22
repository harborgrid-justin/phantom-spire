/**
 * MITRE ATT&CK Framework Page
 * Main page for accessing MITRE data and functionality
 */
import { Metadata } from 'next';
import MitreDashboardClient from './MitreDashboardClient';

export const metadata: Metadata = {
  title: 'MITRE ATT&CK Framework - Phantom ML Studio',
  description: 'Complete MITRE ATT&CK framework integration with threat analysis, technique mapping, and cross-correlation capabilities.',
  keywords: ['MITRE', 'ATT&CK', 'threat analysis', 'cybersecurity', 'technique mapping', 'framework']
};

export default function MitrePage() {
  return <MitreDashboardClient />;
}