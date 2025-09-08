/**
 * Loading Overlay Component
 * Enterprise-grade loading indicator with system status
 */

import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  LinearProgress,
  alpha,
  useTheme,
  Fade,
  Backdrop
} from '@mui/material';
import {
  Security,
  CheckCircle,
  Warning,  Error as ErrorIcon,
  Refresh
} from '@mui/icons-material';
import { SystemStatus } from '../../types/common';

interface LoadingOverlayProps {
  message?: string;
  systemStatus?: SystemStatus;
  progress?: number;
  showProgress?: boolean;
  fullscreen?: boolean;
  transparent?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading...',
  systemStatus = 'operational',
  progress,
  showProgress = false,
  fullscreen = true,
  transparent = false
}) => {
  const theme = useTheme();

  const statusConfig = {
    initializing: {
      color: theme.palette.primary.main,
      icon: <Refresh sx={{ animation: 'spin 2s linear infinite' }} />,
      label: 'Initializing System'
    },
    operational: {
      color: theme.palette.success.main,
      icon: <CheckCircle />,
      label: 'System Operational'
    },
    degraded: {
      color: theme.palette.warning.main,
      icon: <Warning />,
      label: 'Degraded Performance'
    },
    maintenance: {
      color: theme.palette.info.main,
      icon: <Refresh />,
      label: 'Maintenance Mode'
    },
    error: {
      color: theme.palette.error.main,
      icon: <ErrorIcon />,
      label: 'System Error'
    }
  };

  const currentStatus = statusConfig[systemStatus];

  const overlayContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 3,
        p: 4,
        maxWidth: 400,
        mx: 'auto'
      }}
    >
      {/* Logo and System Status */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            mb: 1
          }}
        >
          <Security sx={{ fontSize: 40 }} />
        </Box>
        
        {/* Status Indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -5,
            right: -5,
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: currentStatus.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            border: `2px solid ${theme.palette.background.paper}`,
            boxShadow: theme.shadows[2]
          }}
        >
          {React.cloneElement(currentStatus.icon, { sx: { fontSize: 16 } })}
        </Box>
      </Box>

      {/* Brand */}
      <Box>
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          color="primary"
          gutterBottom
        >
          Phantom Spire
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="textSecondary"
          gutterBottom
        >
          Cyber Threat Intelligence Platform
        </Typography>
      </Box>

      {/* Loading Indicator */}
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          size={60}
          thickness={4}
          value={progress}
          variant={showProgress && progress !== undefined ? 'determinate' : 'indeterminate'}
          sx={{ color: currentStatus.color }}
        />
        {showProgress && progress !== undefined && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography
              variant="caption"
              component="div"
              color="textSecondary"
              fontWeight="bold"
            >
              {`${Math.round(progress)}%`}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Status Message */}
      <Box>
        <Typography 
          variant="body1" 
          color="textPrimary" 
          fontWeight="medium"
          gutterBottom
        >
          {message}
        </Typography>
        <Typography 
          variant="body2" 
          color="textSecondary"
        >
          {currentStatus.label}
        </Typography>
      </Box>

      {/* Progress Bar */}
      {showProgress && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress
            variant={progress !== undefined ? 'determinate' : 'indeterminate'}
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: alpha(currentStatus.color, 0.1),
              '& .MuiLinearProgress-bar': {
                backgroundColor: currentStatus.color,
                borderRadius: 3
              }
            }}
          />
        </Box>
      )}

      {/* Additional Status Information */}
      <Box
        sx={{
          mt: 2,
          p: 2,
          borderRadius: 1,
          backgroundColor: alpha(currentStatus.color, 0.1),
          border: `1px solid ${alpha(currentStatus.color, 0.2)}`,
          width: '100%'
        }}
      >
        <Typography variant="caption" color="textSecondary" align="center">
          {systemStatus === 'initializing' && 'Configuring threat intelligence services...'}
          {systemStatus === 'operational' && 'All systems running normally'}
          {systemStatus === 'degraded' && 'Some services may be slower than usual'}
          {systemStatus === 'maintenance' && 'Scheduled maintenance in progress'}
          {systemStatus === 'error' && 'Technical difficulties detected'}
        </Typography>
      </Box>

      {/* Loading Steps for Initialization */}
      {systemStatus === 'initializing' && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[
              { step: 'Authentication Service', complete: progress ? progress > 25 : false },
              { step: 'Threat Intelligence Engine', complete: progress ? progress > 50 : false },
              { step: 'Security Policies', complete: progress ? progress > 75 : false },
              { step: 'User Interface', complete: progress ? progress > 95 : false }
            ].map((item, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {item.complete ? (
                  <CheckCircle sx={{ fontSize: 16, color: theme.palette.success.main }} />
                ) : (
                  <CircularProgress size={16} thickness={6} />
                )}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    flex: 1,
                    color: item.complete ? theme.palette.success.main : 'textSecondary' 
                  }}
                >
                  {item.step}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );

  if (fullscreen) {
    return (
      <Backdrop
        open={true}
        sx={{
          zIndex: theme.zIndex.modal + 1,
          backgroundColor: transparent 
            ? alpha(theme.palette.background.default, 0.8)
            : theme.palette.background.default,
          backdropFilter: transparent ? 'blur(10px)' : 'none'
        }}
      >
        <Fade in={true} timeout={500}>
          <Box>
            {overlayContent}
          </Box>
        </Fade>
      </Backdrop>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: transparent 
          ? 'transparent'
          : theme.palette.background.default
      }}
    >
      <Fade in={true} timeout={500}>
        <Box>
          {overlayContent}
        </Box>
      </Fade>
    </Box>
  );
};

// CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
document.head.appendChild(style);