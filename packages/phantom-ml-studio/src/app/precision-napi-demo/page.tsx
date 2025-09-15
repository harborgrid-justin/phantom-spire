import type { Metadata } from 'next';
import PrecisionNAPIDemo from '../../components/PrecisionNAPIDemo';

export const metadata: Metadata = {
  title: '32 Precision NAPI Bindings Demo - Phantom ML Studio',
  description: 'Interactive demonstration of all 32 precision NAPI bindings with complete frontend-backend integration.',
};

export default function PrecisionNAPIDemoPage() {
  return <PrecisionNAPIDemo />;
}