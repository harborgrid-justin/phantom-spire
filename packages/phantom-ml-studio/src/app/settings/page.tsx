// src/app/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, CircularProgress, Alert, Box, Grid, TextField, Button, Switch, FormControlLabel, Divider, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { settingsService } from '../../services/settingsService';
import { Settings, ApiKey } from '../../services/settings.types';
import { ServiceContext } from '../../services/core';

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newApiKeyLabel, setNewApiKeyLabel] = useState('');

    const context: ServiceContext = {}; // Mock context

    const fetchSettings = async () => {
        try {
            const response = await settingsService.getSettings({ id: 'get_settings_req', type: 'getSettings' } as any, context);
            if (response.success && response.data) {
                setSettings(response.data);
            } else {
                setError(response.error?.message || 'Failed to fetch settings.');
            }
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleCreateApiKey = async () => {
        if (!newApiKeyLabel) return;
        try {
            await settingsService.createApiKey({ id: 'create_key_req', type: 'createApiKey', data: { label: newApiKeyLabel } } as any, context);
            setNewApiKeyLabel('');
            fetchSettings(); // Refresh settings
        } catch (e) {
            setError((e as Error).message);
        }
    };
    
    const handleDeleteApiKey = async (key: string) => {
        try {
            await settingsService.deleteApiKey({ id: 'delete_key_req', type: 'deleteApiKey', data: { key } } as any, context);
            fetchSettings(); // Refresh settings
        } catch (e) {
            setError((e as Error).message);
        }
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Container maxWidth="lg" sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
    }
    
    if (!settings) {
        return <Container maxWidth="lg" sx={{ py: 4 }}><Typography>No settings found.</Typography></Container>;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>Settings</Typography>
            
            <Grid container spacing={3}>
                {/* API Keys */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>API Keys</Typography>
                        <List>
                            {settings.apiKeys.map(key => (
                                <ListItem key={key.key} secondaryAction={
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteApiKey(key.key)}>
                                        <DeleteIcon />
                                    </IconButton>
                                }>
                                    <ListItemText primary={key.label} secondary={key.key} />
                                </ListItem>
                            ))}
                        </List>
                        <Box sx={{ display: 'flex', mt: 2 }}>
                            <TextField
                                label="New API Key Label"
                                value={newApiKeyLabel}
                                onChange={(e) => setNewApiKeyLabel(e.target.value)}
                                variant="outlined"
                                size="small"
                                sx={{ flexGrow: 1, mr: 2 }}
                            />
                            <Button variant="contained" onClick={handleCreateApiKey}>Create Key</Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}