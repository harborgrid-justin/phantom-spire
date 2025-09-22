import { NextResponse } from 'next/server';
import { TrainingOrchestrator } from '@/services/training-orchestrator';
import { HuggingFaceModelRegistry, RegistryConfig } from '@/models/HuggingFaceModelRegistry';

const registryConfig: RegistryConfig = {
  dataDir: './.registry',
  cacheDir: './.cache',
  syncEnabled: false,
  syncInterval: 60,
  maxCacheSize: 1024,
  enableAnalytics: false,
  enableSecurityScanning: false,
  enableComplianceChecking: false,
};

const registry = new HuggingFaceModelRegistry(registryConfig);
const orchestrator = new TrainingOrchestrator(registry);

export async function POST(request: Request) {
  const jobConfig = await request.json();
  const jobId = await orchestrator.submitJob(jobConfig);
  return NextResponse.json({ jobId });
}
