'use client';

/**
 * User-Friendly Navigation Blocker Components
 * Addresses Controls N.17 and N.38: User-Friendly Navigation Blocking
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface NavigationBlockerDialogProps {
  open: boolean;
  onCancel: () => void;
  onContinue: () => void;
  onSave?: () => Promise<void>;
  hasUnsavedChanges: boolean;
  message?: string;
  saveInProgress?: boolean;
}

/**
 * User-friendly navigation blocker dialog
 * Provides clear options and context for user decisions
 */
export function NavigationBlockerDialog({
  open,
  onCancel,
  onContinue,
  onSave,
  hasUnsavedChanges,
  message = 'You have unsaved changes that will be lost.',
  saveInProgress = false
}: NavigationBlockerDialogProps) {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  const handleSaveAndContinue = async () => {
    if (onSave) {
      try {
        await onSave();
        onContinue();
      } catch (error) {
        console.error('Failed to save changes:', error);
        // Dialog stays open on save failure
      }
    }
  };

  const handleContinueWithoutSaving = () => {
    if (dontAskAgain) {
      // Store user preference
      localStorage.setItem('skipNavigationWarnings', 'true');
    }
    onContinue();
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      aria-labelledby="navigation-blocker-title"
      aria-describedby="navigation-blocker-description"
    >
      <DialogTitle id="navigation-blocker-title">
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="warning" />
          <Typography variant="h6">Unsaved Changes</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box id="navigation-blocker-description">
          <Alert severity="warning" sx={{ mb: 2 }}>
            {message}
          </Alert>

          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            What would you like to do?
          </Typography>

          {hasUnsavedChanges && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={dontAskAgain}
                  onChange={(e) => setDontAskAgain(e.target.checked)}
                  size="small"
                />
              }
              label="Don't ask me again for this session"
              sx={{ mt: 1 }}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onCancel}
          color="inherit"
          disabled={saveInProgress}
        >
          Stay on Page
        </Button>

        {onSave && (
          <Button
            onClick={handleSaveAndContinue}
            color="primary"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={saveInProgress}
          >
            {saveInProgress ? 'Saving...' : 'Save & Continue'}
          </Button>
        )}

        <Button
          onClick={handleContinueWithoutSaving}
          color="error"
          variant="outlined"
          startIcon={<CloseIcon />}
          disabled={saveInProgress}
        >
          Continue Without Saving
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * Hook for user-friendly navigation blocking with dialog
 */
export function useUserFriendlyNavigationBlocker() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<() => void>(() => {});

  const showNavigationDialog = (onContinue: () => void) => {
    // Check if user previously chose "don't ask again"
    const skipWarnings = localStorage.getItem('skipNavigationWarnings') === 'true';

    if (skipWarnings) {
      onContinue();
      return;
    }

    setPendingNavigation(() => onContinue);
    setDialogOpen(true);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setPendingNavigation(() => {});
  };

  const handleContinue = () => {
    setDialogOpen(false);
    pendingNavigation();
    setPendingNavigation(() => {});
  };

  const clearDontAskAgain = () => {
    localStorage.removeItem('skipNavigationWarnings');
  };

  return {
    dialogOpen,
    showNavigationDialog,
    handleCancel,
    handleContinue,
    clearDontAskAgain,
  };
}

/**
 * Enhanced Link component with user-friendly navigation blocking
 */
interface BlockableLink {
  href: string;
  children: React.ReactNode;
  hasUnsavedChanges?: boolean;
  onSave?: () => Promise<void>;
  className?: string;
  [key: string]: any;
}

export function BlockableLink({
  href,
  children,
  hasUnsavedChanges = false,
  onSave,
  className,
  ...props
}: BlockableLink) {
  const { dialogOpen, showNavigationDialog, handleCancel, handleContinue } =
    useUserFriendlyNavigationBlocker();

  const handleClick = (e: React.MouseEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      showNavigationDialog(() => {
        // Navigate programmatically after confirmation
        window.location.href = href;
      });
    }
  };

  return (
    <>
      <a
        href={href}
        onClick={handleClick}
        className={className}
        {...props}
      >
        {children}
      </a>

      <NavigationBlockerDialog
        open={dialogOpen}
        onCancel={handleCancel}
        onContinue={handleContinue}
        onSave={onSave}
        hasUnsavedChanges={hasUnsavedChanges}
      />
    </>
  );
}