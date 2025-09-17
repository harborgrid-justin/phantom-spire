'use client'

import { useEffect, useState } from 'react'
import { Box, Container, Typography, Card, CardContent, Button } from '@mui/material'
import Grid from '@mui/material/Grid2'
import {
  Dashboard as DashboardIcon,
  ModelTraining as ModelIcon,
  DatasetLinked as DataIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material'
import Link from 'next/link'
import { MLSystemStatus } from '../src/components/common/MLSystemStatus'
import { QuickStats } from '../src/components/dashboard/QuickStats'
import { RecentActivity } from '../src/components/dashboard/RecentActivity'
import { PerformanceOverview } from '../src/components/dashboard/PerformanceOverview'

const features = [
  {
    title: 'Model Management',
    description: 'Train, deploy, and monitor machine learning models for security analytics',
    icon: ModelIcon,
    href: '/models',
    color: '#6366f1'
  },
  {
    title: 'Dataset Operations',
    description: 'Upload, process, and analyze security datasets with advanced preprocessing',
    icon: DataIcon,
    href: '/datasets',
    color: '#14b8a6'
  },
  {
    title: 'Training Pipeline',
    description: 'Automated ML pipeline for threat detection and security pattern recognition',
    icon: AnalyticsIcon,
    href: '/training',
    color: '#f59e0b'
  },
  {
    title: 'Security Analytics',
    description: 'Real-time threat detection using advanced machine learning algorithms',
    icon: SecurityIcon,
    href: '/dashboard',
    color: '#ef4444'
  },
  {
    title: 'Performance Monitoring',
    description: 'Monitor model performance, accuracy metrics, and system health',
    icon: TrendingIcon,
    href: '/experiments',
    color: '#10b981'
  },
  {
    title: 'Enterprise Dashboard',
    description: 'Comprehensive overview of ML operations and security insights',
    icon: DashboardIcon,
    href: '/dashboard',
    color: '#8b5cf6'
  }
]

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <Container maxWidth="xl" className="py-8">
      {/* Hero Section */}
      <Box className={`text-center mb-12 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
        <Typography
          variant="h2"
          component="h1"
          className="font-bold text-gray-900 mb-4"
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #14b8a6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Phantom ML Studio
        </Typography>
        <Typography variant="h5" className="text-gray-600 mb-6 max-w-3xl mx-auto">
          Enterprise Machine Learning Platform for Advanced Security Analytics and Threat Detection
        </Typography>
        <Typography variant="body1" className="text-gray-500 mb-8 max-w-4xl mx-auto">
          Leverage cutting-edge machine learning algorithms to detect sophisticated cyber threats,
          analyze security patterns, and automate threat response with enterprise-grade reliability and performance.
        </Typography>

        {/* System Status */}
        <Box className="mb-8">
          <MLSystemStatus />
        </Box>
      </Box>

      {/* Quick Stats */}
      <Box className="mb-12">
        <QuickStats />
      </Box>

      {/* Performance Overview */}
      <Box className="mb-12">
        <PerformanceOverview />
      </Box>

      {/* Feature Grid */}
      <Box className="mb-12">
        <Typography variant="h4" className="text-gray-900 font-bold mb-8 text-center">
          Platform Capabilities
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={feature.title}>
                <Card
                  className={`ml-card h-full cursor-pointer transform hover:scale-105 transition-all duration-200 ${
                    isLoaded ? 'animate-fade-in' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <Box className="flex items-center mb-4">
                      <Box
                        className="p-3 rounded-lg mr-4"
                        sx={{ backgroundColor: `${feature.color}20` }}
                      >
                        <IconComponent
                          sx={{
                            color: feature.color,
                            fontSize: 32
                          }}
                        />
                      </Box>
                      <Typography variant="h6" className="font-semibold text-gray-900">
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" className="text-gray-600 mb-4 line-clamp-3">
                      {feature.description}
                    </Typography>
                    <Link href={feature.href} passHref>
                      <Button
                        variant="outlined"
                        className="mt-auto"
                        sx={{
                          borderColor: feature.color,
                          color: feature.color,
                          '&:hover': {
                            borderColor: feature.color,
                            backgroundColor: `${feature.color}10`
                          }
                        }}
                      >
                        Explore
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Box>

      {/* Recent Activity */}
      <Box className="mb-12">
        <RecentActivity />
      </Box>

      {/* Getting Started */}
      <Box className="text-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-8">
        <Typography variant="h4" className="font-bold text-gray-900 mb-4">
          Ready to Start?
        </Typography>
        <Typography variant="body1" className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Begin your machine learning journey with our guided setup process.
          Train your first security model in minutes.
        </Typography>
        <Box className="flex gap-4 justify-center flex-wrap">
          <Link href="/training" passHref>
            <Button
              variant="contained"
              size="large"
              className="ml-button-primary"
            >
              Start Training
            </Button>
          </Link>
          <Link href="/datasets" passHref>
            <Button
              variant="outlined"
              size="large"
              className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
            >
              Upload Dataset
            </Button>
          </Link>
          <Link href="/dashboard" passHref>
            <Button
              variant="outlined"
              size="large"
              className="border-gray-600 text-gray-600 hover:bg-gray-50"
            >
              View Dashboard
            </Button>
          </Link>
        </Box>
      </Box>
    </Container>
  )
}