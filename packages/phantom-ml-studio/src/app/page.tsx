import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Box,
  Typography,
  Container,
  Grid2 as Grid,
  Card,
  CardContent,
  Chip,
  Button,
  LinearProgress,
  Paper,
  Stack
} from '@mui/material';

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
  href: string;
  status?: 'active' | 'beta' | 'coming-soon';
}

function FeatureCard({ title, description, href, status = 'active' }: FeatureCardProps) {
  const isDisabled = status === 'coming-soon';

  const card = (
    <Card
      sx={{
        height: '100%',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': isDisabled ? {} : {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="h6" component="h3" gutterBottom>
            {title}
          </Typography>
          {status !== 'active' && (
            <Box>
              <Chip
                label={status === 'beta' ? 'Beta' : 'Coming Soon'}
                color={status === 'beta' ? 'primary' : 'default'}
                size="small"
              />
            </Box>
          )}
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>
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
      href: '/precision-napi-demo',
      status: 'active'
    },
    {
      title: 'Enhanced Dashboard',
      description: 'Real-time monitoring with business intelligence using precision NAPI bindings for comprehensive metrics.',
      href: '/dashboard'
    },
    {
      title: 'Enhanced Model Builder',
      description: 'AutoML with 32 precision bindings: advanced optimization, validation, and enterprise-grade model management.',
      href: '/model-builder'
    },
    {
      title: 'Real-time Analytics',
      description: 'Stream processing, batch analytics, and business intelligence with precision NAPI performance.',
      href: '/real-time-monitoring'
    },
    {
      title: 'Data Explorer',
      description: 'Comprehensive data analysis with statistical summaries, correlation analysis, and quality assessment.',
      href: '/data-explorer'
    },
    {
      title: 'Business Intelligence',
      description: 'ROI calculations, cost-benefit analysis, performance forecasting, and resource optimization.',
      href: '/business-intelligence'
    },
    {
      title: 'Enterprise Security',
      description: 'Audit trails, compliance reporting, security scanning, backup systems, and disaster recovery.',
      href: '/enterprise-security-compliance'
    },
    {
      title: 'Threat Intelligence',
      description: 'Advanced cybersecurity ML models integrated with the Phantom Spire security intelligence platform.',
      href: '/threat-intelligence-marketplace'
    },
    {
      title: 'AutoML Pipeline',
      description: 'Visual pipeline builder for automated machine learning workflows.',
      href: '/automl-pipeline-visualizer',
      status: 'beta'
    },
    {
      title: 'Bias Detection',
      description: 'AI fairness tools to detect and mitigate bias in machine learning models.',
      href: '/bias-detection-engine',
      status: 'beta'
    },
    {
      title: 'Explainable AI',
      description: 'Model interpretability and explanation tools for transparent AI decisions.',
      href: '/explainable-ai-visualizer',
      status: 'coming-soon'
    }
  ];

  return (
    <Grid container spacing={3}>
      {features.map((feature, index) => (
        <Grid xs={12} sm={6} md={4} key={index}>
          <FeatureCard {...feature} />
        </Grid>
      ))}
    </Grid>
  );
}

function HomePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Hero Section */}
      <Box textAlign="center" mb={8}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            mb: 3
          }}
        >
          Phantom ML Studio
        </Typography>
        <Typography
          variant="h4"
          component="h2"
          color="text.secondary"
          sx={{
            maxWidth: '800px',
            mx: 'auto',
            mb: 4,
            fontSize: { xs: '1.25rem', md: '1.5rem' }
          }}
        >
          Enterprise-grade machine learning platform with advanced security features,
          AutoML capabilities, and seamless Hugging Face integration.
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          flexWrap="wrap"
          sx={{ gap: 1 }}
        >
          <Chip label="Enterprise Ready" variant="outlined" color="primary" />
          <Chip label="Security First" variant="outlined" color="secondary" />
          <Chip label="AutoML Powered" variant="outlined" color="primary" />
          <Chip label="Hugging Face Integration" variant="outlined" color="secondary" />
        </Stack>
      </Box>

      {/* 32 Precision Modules Alert */}
      <Paper
        sx={{
          p: 3,
          mb: 5,
          backgroundColor: 'success.light',
          borderLeft: 4,
          borderColor: 'success.main'
        }}
      >
        <Typography variant="h6" color="success.dark" gutterBottom>
          🚀 32 Precision Modules Integrated
        </Typography>
        <Typography variant="body1" color="success.dark" paragraph>
          Complete frontend-backend integration achieved with 32 high-precision NAPI bindings:
          8 Model Management, 8 Analytics & Insights, 6 Real-time Processing, 5 Enterprise Features,
          and 5 Business Intelligence modules - all with enterprise-grade fallback support.
        </Typography>
        <LinearProgress
          variant="determinate"
          value={100}
          color="success"
          sx={{ mb: 1, height: 8, borderRadius: 4 }}
        />
        <Typography variant="caption" color="text.secondary">
          Integration Status: 100% Complete (32/32 modules active)
        </Typography>
      </Paper>

      {/* Statistics Section */}
      <Paper
        elevation={2}
        sx={{
          p: 5,
          mb: 8,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 2
        }}
      >
        <Grid container spacing={4} textAlign="center">
          <Grid xs={12} sm={6} md={3}>
            <Typography variant="h2" color="primary.main" fontWeight="bold">
              32
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Precision NAPI Modules
            </Typography>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Typography variant="h2" color="primary.main" fontWeight="bold">
              19+
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Security Intelligence Modules
            </Typography>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Typography variant="h2" color="primary.main" fontWeight="bold">
              5
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Multi-Database Support
            </Typography>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Typography variant="h2" color="primary.main" fontWeight="bold">
              99.9%
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enterprise SLA
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Features Section */}
      <Box mb={8}>
        <Typography variant="h3" textAlign="center" gutterBottom color="text.primary">
          Platform Features
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" paragraph>
          Comprehensive ML tools designed for enterprise cybersecurity and intelligence applications
        </Typography>
        <FeaturesGrid />
      </Box>

      {/* CTA Section */}
      <Paper
        elevation={4}
        sx={{
          p: 5,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Typography variant="h3" gutterBottom>
          Ready to Get Started?
        </Typography>
        <Typography variant="h6" paragraph sx={{ mb: 4 }}>
          Begin your enterprise ML journey with powerful tools designed for security-first applications.
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
        >
          <Button
            component={Link}
            href="/dashboard"
            variant="contained"
            size="large"
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'grey.100'
              }
            }}
          >
            View Dashboard
          </Button>
          <Button
            component={Link}
            href="/model-builder"
            variant="outlined"
            size="large"
            sx={{
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
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
  return <HomePage />;
}
