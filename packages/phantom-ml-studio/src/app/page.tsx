import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  Paper,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ModelTraining as ModelIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Speed as PerformanceIcon,
  AutoAwesome as AutoMLIcon,
  Engineering as EngineeringIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Phantom ML Studio - 32 Precision Modules Enterprise Platform',
  description: 'Advanced enterprise ML platform with 32 precision NAPI bindings, complete frontend-backend integration, and enterprise-grade capabilities.',
  keywords: ['machine learning', 'NAPI', '32 precision modules', 'enterprise AI', 'cybersecurity', 'threat intelligence', 'precision bindings'],
  authors: [{ name: 'Phantom Spire' }],
  openGraph: {
    title: 'Phantom ML Studio - 32 Precision Modules',
    description: 'Enterprise Machine Learning Platform with Complete Integration',
    type: 'website',
  },
  robots: {
    index: false,
    follow: false,
  },
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  status?: 'active' | 'beta' | 'coming-soon';
}

function FeatureCard({ title, description, icon, href, status = 'active' }: FeatureCardProps) {
  const isDisabled = status === 'coming-soon';

  const card = (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease',
        cursor: isDisabled ? 'default' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        '&:hover': {
          transform: isDisabled ? 'none' : 'translateY(-4px)',
          boxShadow: isDisabled ? 'none' : 3
        }
      }}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ mr: 2, color: 'primary.main' }}>
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {title}
            </Typography>
            {status !== 'active' && (
              <Chip
                label={status === 'beta' ? 'Beta' : 'Coming Soon'}
                size="small"
                color={status === 'beta' ? 'primary' : 'default'}
              />
            )}
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  return isDisabled ? card : (
    <Link href={href} style={{ textDecoration: 'none' }}>
      {card}
    </Link>
  );
}

function FeaturesGrid() {
  const features: FeatureCardProps[] = [
    {
      title: '32 Precision NAPI Demo',
      description: 'Interactive demonstration of all 32 precision NAPI bindings with complete frontend-backend integration.',
      icon: <EngineeringIcon fontSize="large" />,
      href: '/precision-napi-demo',
      status: 'active'
    },
    {
      title: 'Enhanced Dashboard',
      description: 'Real-time monitoring with business intelligence using precision NAPI bindings for comprehensive metrics.',
      icon: <DashboardIcon fontSize="large" />,
      href: '/dashboard'
    },
    {
      title: 'Enhanced Model Builder',
      description: 'AutoML with 32 precision bindings: advanced optimization, validation, and enterprise-grade model management.',
      icon: <AutoMLIcon fontSize="large" />,
      href: '/model-builder'
    },
    {
      title: 'Real-time Analytics',
      description: 'Stream processing, batch analytics, and business intelligence with precision NAPI performance.',
      icon: <AnalyticsIcon fontSize="large" />,
      href: '/real-time-monitoring'
    },
    {
      title: 'Data Explorer',
      description: 'Comprehensive data analysis with statistical summaries, correlation analysis, and quality assessment.',
      icon: <AnalyticsIcon fontSize="large" />,
      href: '/data-explorer'
    },
    {
      title: 'Business Intelligence',
      description: 'ROI calculations, cost-benefit analysis, performance forecasting, and resource optimization.',
      icon: <BusinessIcon fontSize="large" />,
      href: '/business-intelligence'
    },
    {
      title: 'Enterprise Security',
      description: 'Audit trails, compliance reporting, security scanning, backup systems, and disaster recovery.',
      icon: <SecurityIcon fontSize="large" />,
      href: '/enterprise-security-compliance'
    },
    {
      title: 'Threat Intelligence',
      description: 'Advanced cybersecurity ML models integrated with the Phantom Spire security intelligence platform.',
      icon: <SecurityIcon fontSize="large" />,
      href: '/threat-intelligence-marketplace'
    },
    {
      title: 'AutoML Pipeline',
      description: 'Visual pipeline builder for automated machine learning workflows.',
      icon: <AutoMLIcon fontSize="large" />,
      href: '/automl-pipeline-visualizer',
      status: 'beta'
    },
    {
      title: 'Bias Detection',
      description: 'AI fairness tools to detect and mitigate bias in machine learning models.',
      icon: <SecurityIcon fontSize="large" />,
      href: '/bias-detection-engine',
      status: 'beta'
    },
    {
      title: 'Explainable AI',
      description: 'Model interpretability and explanation tools for transparent AI decisions.',
      icon: <AnalyticsIcon fontSize="large" />,
      href: '/explainable-ai-visualizer',
      status: 'coming-soon'
    }
  ];

  return (
    <Grid container spacing={3}>
      {features.map((feature, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <FeatureCard {...feature} />
        </Grid>
      ))}
    </Grid>
  );
}

function HomePage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            mb: 2
          }}
        >
          Phantom ML Studio
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}
        >
          Enterprise-grade machine learning platform with advanced security features,
          AutoML capabilities, and seamless Hugging Face integration.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
          <Chip label="Enterprise Ready" color="primary" variant="outlined" />
          <Chip label="Security First" color="secondary" variant="outlined" />
          <Chip label="AutoML Powered" color="primary" variant="outlined" />
          <Chip label="Hugging Face Integration" color="secondary" variant="outlined" />
        </Stack>
      </Box>

      {/* 32 Precision Modules Alert */}
      <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" component="div" gutterBottom>
          🚀 32 Precision Modules Integrated
        </Typography>
        <Typography variant="body2">
          Complete frontend-backend integration achieved with 32 high-precision NAPI bindings:
          8 Model Management, 8 Analytics & Insights, 6 Real-time Processing, 5 Enterprise Features, 
          and 5 Business Intelligence modules - all with enterprise-grade fallback support.
        </Typography>
        <Box sx={{ mt: 2, mb: 1 }}>
          <LinearProgress variant="determinate" value={100} color="success" />
        </Box>
        <Typography variant="caption" color="text.secondary">
          Integration Status: 100% Complete (32/32 modules active)
        </Typography>
      </Alert>

      {/* Statistics Section */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          mb: 6,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <Grid container spacing={4} textAlign="center">
          <Grid item xs={12} sm={3}>
            <Typography variant="h3" color="primary" fontWeight="bold">
              32
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Precision NAPI Modules
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="h3" color="primary" fontWeight="bold">
              19+
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Security Intelligence Modules
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="h3" color="primary" fontWeight="bold">
              5
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Multi-Database Support
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="h3" color="primary" fontWeight="bold">
              99.9%
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enterprise SLA
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Features Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center">
          Platform Features
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          Comprehensive ML tools designed for enterprise cybersecurity and intelligence applications
        </Typography>
        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>Loading features...</Box>}>
          <FeaturesGrid />
        </Suspense>
      </Box>

      {/* CTA Section */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Typography variant="h4" gutterBottom>
          Ready to Get Started?
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Begin your enterprise ML journey with powerful tools designed for security-first applications.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            component={Link}
            href="/dashboard"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            View Dashboard
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={Link}
            href="/model-builder"
            sx={{
              borderColor: 'white',
              color: 'white',
              '&:hover': { borderColor: 'grey.300', bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Start Building
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Phantom ML Studio...</Box>}>
      <HomePage />
    </Suspense>
  );
}
