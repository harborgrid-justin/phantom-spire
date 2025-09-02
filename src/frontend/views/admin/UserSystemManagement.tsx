/**
 * User & System Management
 * Admin interface for user management and system configuration
 */

import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Snackbar,
  Alert
} from '@mui/material';
import { AdminPanelSettings, Group, Settings, Security } from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

export const UserSystemManagement: React.FC = () => {
  // Enhanced business logic integration
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('admin');

  const [activeTab, setActiveTab] = React.useState(0);

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('user-system-management', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 180000
    });

    return () => evaluationController.remove();
  }, []);

  // Business logic operations
  const handleCreateUser = async (userData: any) => {
    try {
      await businessLogic.execute('create-user', userData, 'medium');
      addNotification('success', 'User created successfully');
    } catch (error) {
      addNotification('error', 'Failed to create user');
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      await businessLogic.execute('update-user-role', { userId, role });
      addNotification('success', 'User role updated');
    } catch (error) {
      addNotification('error', 'Failed to update user role');
    }
  };

  const handleSystemConfiguration = async (config: any) => {
    try {
      await businessLogic.execute('update-system-config', config, 'high');
      addNotification('info', 'System configuration updated');
    } catch (error) {
      addNotification('error', 'Failed to update system configuration');
    }
  };

  const users = [
    { id: 1, name: 'John Smith', email: 'john.smith@company.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'Analyst', status: 'Active' },
    { id: 3, name: 'Mike Davis', email: 'mike.davis@company.com', role: 'Investigator', status: 'Inactive' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        👥 User & System Management
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Manage users, roles, permissions, and system configuration.
      </Typography>
      
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Users" />
          <Tab label="Roles & Permissions" />
          <Tab label="System Settings" />
          <Tab label="Audit Logs" />
        </Tabs>
      </Paper>
      
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar>{user.name.charAt(0)}</Avatar>
                            <Typography>{user.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip size="small" label={user.role} color="primary" />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={user.status} 
                            color={user.status === 'Active' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Button size="small">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {activeTab === 1 && (
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Role Management</Typography>
            <Typography variant="body2" color="textSecondary">
              Configure user roles and permissions for the threat intelligence platform.
            </Typography>
          </CardContent>
        </Card>
      )}
      
      {activeTab === 2 && (
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>System Configuration</Typography>
            <Typography variant="body2" color="textSecondary">
              Configure system-wide settings and preferences.
            </Typography>
          </CardContent>
        </Card>
      )}
      
      {activeTab === 3 && (
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Audit Logs</Typography>
            <Typography variant="body2" color="textSecondary">
              View system audit logs and user activity.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={6000}
          onClose={() => removeNotification(notification.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={notification.type}
            onClose={() => removeNotification(notification.id)}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};
