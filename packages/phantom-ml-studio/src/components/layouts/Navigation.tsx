'use client'

import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Chip,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ModelTraining as ModelIcon,
  DatasetLinked as DataIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Home as HomeIcon,
  Psychology as ExperimentIcon,
  Security as SecurityIcon
} from '@mui/icons-material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMLCoreStatus, useSystemInfo } from '../providers/MLCoreProvider'

const navigationItems = [
  {
    title: 'Home',
    href: '/',
    icon: HomeIcon,
    description: 'Platform overview and quick access'
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: DashboardIcon,
    description: 'ML operations dashboard and monitoring'
  },
  {
    title: 'Models',
    href: '/models',
    icon: ModelIcon,
    description: 'Model management and deployment'
  },
  {
    title: 'Training',
    href: '/training',
    icon: AnalyticsIcon,
    description: 'Model training and optimization'
  },
  {
    title: 'Datasets',
    href: '/datasets',
    icon: DataIcon,
    description: 'Data management and preprocessing'
  },
  {
    title: 'Experiments',
    href: '/experiments',
    icon: ExperimentIcon,
    description: 'Experiment tracking and comparison'
  }
]

const drawerWidth = 280

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null)
  const pathname = usePathname()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const { isInitialized, isLoading, error } = useMLCoreStatus()
  const { systemInfo } = useSystemInfo()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (_event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null)
  }

  const getStatusChip = () => {
    if (isLoading) {
      return (
        <Chip
          label="Initializing"
          size="small"
          color="warning"
          variant="outlined"
        />
      )
    }

    if (error) {
      return (
        <Tooltip title={error}>
          <Chip
            label="Error"
            size="small"
            color="error"
            variant="outlined"
          />
        </Tooltip>
      )
    }

    if (isInitialized) {
      return (
        <Tooltip title={`ML Core v${systemInfo?.version || '1.0.1'} running on ${systemInfo?.platform || 'unknown'}`}>
          <Chip
            label="Online"
            size="small"
            color="success"
            variant="outlined"
          />
        </Tooltip>
      )
    }

    return (
      <Chip
        label="Offline"
        size="small"
        color="default"
        variant="outlined"
      />
    )
  }

  const drawer = (
    <Box sx={{ width: drawerWidth, height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          🔮 ML Studio
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Enterprise Security Analytics
        </Typography>
        <Box sx={{ mt: 1 }}>
          {getStatusChip()}
        </Box>
      </Box>

      <List sx={{ px: 1, py: 2 }}>
        {navigationItems.map((item) => {
          const IconComponent = item.icon
          const isActive = pathname === item.href

          return (
            <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
              <Link href={item.href} style={{ textDecoration: 'none', width: '100%' }}>
                <ListItemButton
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                    '&:hover': {
                      backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon>
                    <IconComponent />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    secondary={!isActive ? item.description : undefined}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      sx: { opacity: 0.7 }
                    }}
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          )
        })}
      </List>

      <Divider />

      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding>
          <Link href="/settings" style={{ textDecoration: 'none', width: '100%' }}>
            <ListItemButton sx={{ borderRadius: 2, mx: 1 }}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </Link>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mr: 2 }}>
                🔮 Phantom ML Studio
              </Typography>
              {getStatusChip()}
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
              {navigationItems.slice(0, 4).map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.title} href={item.href} style={{ textDecoration: 'none' }}>
                    <Button
                      variant={isActive ? 'contained' : 'text'}
                      color="primary"
                      sx={{
                        minWidth: 'auto',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500,
                      }}
                    >
                      {item.title}
                    </Button>
                  </Link>
                )
              })}
            </Box>
          )}

          {/* Notifications */}
          <IconButton size="large" color="inherit" sx={{ mr: 1 }}>
            <NotificationsIcon />
          </IconButton>

          {/* Profile Menu */}
          <IconButton
            size="large"
            edge="end"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <AccountIcon />
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={profileMenuAnchor}
            open={Boolean(profileMenuAnchor)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleProfileMenuClose}>
              <AccountIcon sx={{ mr: 2 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>
              <SettingsIcon sx={{ mr: 2 }} />
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleProfileMenuClose}>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              top: 64, // AppBar height
              height: 'calc(100% - 64px)',
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}
    </>
  )
}