import Link from 'next/link';

export default function Dashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h1 data-cy="page-title">Dashboard</h1>
      <p data-cy="page-description">Welcome to the Phantom ML Studio Dashboard</p>
      <div data-cy="dashboard-metrics">
        <div data-cy="metric-card">Models: 12</div>
        <div data-cy="metric-card">Experiments: 8</div>
        <div data-cy="metric-card">Deployments: 5</div>
      </div>
      <nav data-cy="dashboard-nav">
        <Link href="/model-builder" data-cy="nav-link">Model Builder</Link>
        <Link href="/data-explorer" data-cy="nav-link">Data Explorer</Link>
        <Link href="/experiments" data-cy="nav-link">Experiments</Link>
      </nav>
    </div>
  );
}