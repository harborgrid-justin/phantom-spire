import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Phantom ML Studio',
  description: 'Machine learning dashboard with model metrics, experiments overview, and deployment status for enterprise ML operations.',
  keywords: ['dashboard', 'ML metrics', 'model monitoring', 'experiments', 'deployments']
};

interface PageProps {
  params: Record<string, string>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function Dashboard(props: PageProps): JSX.Element {
  return (
    <main style={{ padding: '20px' }} role="main" aria-labelledby="dashboard-title">
      <h1 id="dashboard-title" data-cy="page-title">Dashboard</h1>
      <p data-cy="page-description">Welcome to the Phantom ML Studio Dashboard</p>
      <section data-cy="dashboard-metrics" aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="sr-only">System Metrics</h2>
        <div data-cy="metric-card" role="region" aria-label="Models count">Models: 12</div>
        <div data-cy="metric-card" role="region" aria-label="Experiments count">Experiments: 8</div>
        <div data-cy="metric-card" role="region" aria-label="Deployments count">Deployments: 5</div>
      </section>
      <nav data-cy="dashboard-nav" aria-label="Main navigation">
        <Link href="/modelBuilder" data-cy="nav-link" aria-label="Go to Model Builder">Model Builder</Link>
        <Link href="/dataExplorer" data-cy="nav-link" aria-label="Go to Data Explorer">Data Explorer</Link>
        <Link href="/experiments" data-cy="nav-link" aria-label="Go to Experiments">Experiments</Link>
      </nav>
    </main>
  );
}