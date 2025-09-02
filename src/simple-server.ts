import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware - disable CSP for frontend pages
app.use((req, res, next) => {
  if (req.path.startsWith('/frontend')) {
    // Disable CSP for frontend pages
    helmet({
      contentSecurityPolicy: false
    })(req, res, next);
  } else {
    // Use normal CSP for other pages
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://fonts.googleapis.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"]
        }
      }
    })(req, res, next);
  }
});
app.use(cors());

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from setup directory (in src, not dist)
const srcDir = path.join(__dirname, '..', 'src');
app.use('/setup/static', express.static(path.join(srcDir, 'setup/static')));

// Setup page route
app.get('/setup', (_req, res) => {
  res.sendFile(path.join(srcDir, 'setup/static/index.html'));
});

// Dashboard page route
app.get('/dashboard', (_req, res) => {
  res.sendFile(path.join(srcDir, 'setup/static/dashboard.html'));
});

// Frontend React application route
app.get('/frontend', (_req, res) => {
  res.sendFile(path.join(srcDir, 'setup/static/frontend.html'));
});

// Views demo route
app.get('/views', (_req, res) => {
  res.sendFile(path.join(srcDir, 'setup/static/views-demo.html'));
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root endpoint - main entry point
app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Phantom Spire CTI Platform',
    version: '1.0.0',
    description: 'Enterprise-grade Cyber Threat Intelligence Platform',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      setup: '/setup',
      dashboard: '/dashboard',
    },
    ui: {
      setup: 'http://localhost:3000/setup',
      dashboard: 'http://localhost:3000/dashboard',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} was not found on this server.`,
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Phantom Spire CTI Platform started on port ${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌐 Main Entry Point: http://localhost:${PORT}/`);
  console.log(`⚙️ Setup Interface: http://localhost:${PORT}/setup`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
});

// Handle server errors
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

export { app };
