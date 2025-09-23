/**
 * MODAL & DIALOG COMPONENTS
 * 
 * Comprehensive modal, dialog, drawer, and overlay components
 */

'use client';

import React, { forwardRef, useEffect, useCallback } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { 
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer as MuiDrawer,
  Modal as MuiModal,
  Backdrop,
  Fade,
  Slide,
  IconButton,
  Typography,
  Box,
  Button,
  Divider,
  Alert,
  Paper,
  Popover as MuiPopover,
  Popper,
  ClickAwayListener,
  useMediaQuery,
} from '@mui/material';
import { 
  Close as CloseIcon,
  Fullscreen,
  FullscreenExit,
  ArrowBack,
} from '@mui/icons-material';
import { BaseLayoutProps } from '../types';

// Component interfaces
export interface ModalProps extends BaseLayoutProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  maxWidth?: string | number;
  fullScreen?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  loading?: boolean;
  error?: string;
  TransitionComponent?: React.ComponentType<any>;
  TransitionProps?: any;
}

export interface DialogProps extends ModalProps {
  subtitle?: string;
  actions?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'confirmation' | 'alert' | 'form';
  severity?: 'info' | 'warning' | 'error' | 'success';
  destructive?: boolean;
}

export interface DrawerProps extends BaseLayoutProps {
  open: boolean;
  onClose: () => void;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  variant?: 'temporary' | 'persistent' | 'permanent';
  width?: number;
  height?: number;
  title?: React.ReactNode;
  subtitle?: string;
  showCloseButton?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  keepMounted?: boolean;
  hideBackdrop?: boolean;
  elevation?: number;
}

export interface PopoverProps extends BaseLayoutProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  anchorOrigin?: {
    vertical: 'top' | 'center' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  transformOrigin?: {
    vertical: 'top' | 'center' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  title?: string;
  actions?: React.ReactNode;
  maxWidth?: number;
  arrow?: boolean;
  elevation?: number;
}

export interface OverlayProps extends BaseLayoutProps {
  open: boolean;
  onClose?: () => void;
  blur?: boolean;
  opacity?: number;
  zIndex?: number;
  closeOnClick?: boolean;
  loading?: boolean;
  message?: React.ReactNode;
}

export interface SlideOverProps extends BaseLayoutProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  actions?: React.ReactNode;
  position?: 'left' | 'right';
}

export interface BottomSheetProps extends BaseLayoutProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  height?: 'auto' | 'full' | number;
  showHandle?: boolean;
  showCloseButton?: boolean;
  snapPoints?: number[];
  defaultSnapPoint?: number;
}

// Styled Components
const ModalRoot = styled(MuiModal)<{ size?: string; maxWidth?: string | number }>(
  ({ theme, size, maxWidth }) => {
    const getSizeStyles = () => {
      switch (size) {
        case 'xs':
          return { maxWidth: 400 };
        case 'sm':
          return { maxWidth: 600 };
        case 'md':
          return { maxWidth: 800 };
        case 'lg':
          return { maxWidth: 1200 };
        case 'xl':
          return { maxWidth: 1600 };
        case 'fullscreen':
          return { 
            width: '100vw', 
            height: '100vh',
            maxWidth: 'none',
            maxHeight: 'none',
            borderRadius: 0,
          };
        default:
          return { maxWidth: 800 };
      }
    };

    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing(2),
      '& .modal-content': {
        outline: 'none',
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[24],
        width: '100%',
        ...getSizeStyles(),
        ...(maxWidth && { maxWidth }),
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      },
    };
  }
);

const DialogHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
}));

const DialogContentStyled = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  flex: 1,
  overflow: 'auto',
}));

const DialogActionsStyled = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const DrawerContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  flex: 1,
  overflow: 'auto',
}));

const PopoverContent = styled(Paper)(({ theme }) => ({
  maxWidth: 400,
  overflow: 'hidden',
}));

const PopoverHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const OverlayRoot = styled(Box)<{ 
  blur?: boolean; 
  opacity?: number; 
  zIndex?: number;
}>(({ theme, blur, opacity = 0.5, zIndex = 1300 }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: `rgba(0, 0, 0, ${opacity})`,
  zIndex,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...(blur && {
    backdropFilter: 'blur(4px)',
  }),
}));

const SlideOverRoot = styled(MuiDrawer)<{ size?: string }>(({ theme, size }) => {
  const getWidth = () => {
    switch (size) {
      case 'sm': return 320;
      case 'md': return 480;
      case 'lg': return 640;
      case 'xl': return 800;
      default: return 480;
    }
  };

  return {
    '& .MuiDrawer-paper': {
      width: getWidth(),
      [theme.breakpoints.down('sm')]: {
        width: '100vw',
      },
    },
  };
});

const BottomSheetRoot = styled(MuiDrawer)<{ height?: string | number }>(
  ({ theme, height = 'auto' }) => ({
    '& .MuiDrawer-paper': {
      borderTopLeftRadius: theme.spacing(2),
      borderTopRightRadius: theme.spacing(2),
      ...(height === 'auto' ? { height: 'auto', maxHeight: '80vh' } :
          height === 'full' ? { height: '100vh' } : 
          { height: typeof height === 'number' ? `${height}px` : height }),
    },
  })
);

const SheetHandle = styled(Box)(({ theme }) => ({
  width: 32,
  height: 4,
  backgroundColor: theme.palette.grey[400],
  borderRadius: 2,
  margin: `${theme.spacing(1)} auto`,
}));

// Modal Component
export const Modal = forwardRef<HTMLDivElement, ModalProps>(({
  children,
  open,
  onClose,
  title,
  size = 'md',
  maxWidth,
  fullScreen = false,
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  loading = false,
  error,
  TransitionComponent = Fade,
  TransitionProps,
  className,
  ...props
}, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, closeOnEscape, handleClose]);

  return (
    <ModalRoot
      ref={ref}
      open={open}
      onClose={closeOnBackdrop ? handleClose : undefined}
      size={fullScreen || isMobile ? 'fullscreen' : size}
      maxWidth={maxWidth}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      className={className}
      {...props}
    >
      <TransitionComponent in={open} {...TransitionProps}>
        <Box className="modal-content">
          {(title || showCloseButton) && (
            <DialogHeader>
              <Box>
                {title && (
                  <Typography variant="h6" component="h2">
                    {title}
                  </Typography>
                )}
              </Box>
              {showCloseButton && (
                <IconButton
                  onClick={handleClose}
                  disabled={loading}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              )}
            </DialogHeader>
          )}
          
          <DialogContentStyled>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {children}
          </DialogContentStyled>
        </Box>
      </TransitionComponent>
    </ModalRoot>
  );
});

// Dialog Component
export const Dialog = forwardRef<HTMLDivElement, DialogProps>(({
  children,
  subtitle,
  actions,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  severity,
  destructive = false,
  ...modalProps
}, ref) => {
  const getSeverityIcon = () => {
    switch (severity) {
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      case 'info': 
      default: return 'ℹ️';
    }
  };

  const renderActions = () => {
    if (actions) return actions;

    if (variant === 'confirmation') {
      return (
        <>
          <Button onClick={onCancel || modalProps.onClose}>
            {cancelText}
          </Button>
          <Button
            variant="contained"
            color={destructive ? 'error' : 'primary'}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </>
      );
    }

    if (variant === 'alert') {
      return (
        <Button
          variant="contained"
          onClick={modalProps.onClose}
        >
          OK
        </Button>
      );
    }

    return null;
  };

  return (
    <Modal ref={ref} {...modalProps}>
      {severity && (
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="h4">
            {getSeverityIcon()}
          </Typography>
          <Box>
            {modalProps.title && (
              <Typography variant="h6" component="h2">
                {modalProps.title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      
      {children}
      
      {renderActions() && (
        <>
          <Divider sx={{ mt: 3, mb: 0 }} />
          <DialogActionsStyled>
            {renderActions()}
          </DialogActionsStyled>
        </>
      )}
    </Modal>
  );
});

// Drawer Component
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(({
  children,
  open,
  onClose,
  anchor = 'right',
  variant = 'temporary',
  width = 400,
  height = 400,
  title,
  subtitle,
  showCloseButton = true,
  showBackButton = false,
  onBack,
  keepMounted = false,
  hideBackdrop = false,
  elevation = 16,
  className,
  ...props
}, ref) => {
  const isHorizontal = anchor === 'left' || anchor === 'right';

  return (
    <MuiDrawer
      ref={ref}
      open={open}
      onClose={onClose}
      anchor={anchor}
      variant={variant}
      keepMounted={keepMounted}
      hideBackdrop={hideBackdrop}
      elevation={elevation}
      className={className}
      PaperProps={{
        sx: {
          width: isHorizontal ? width : 'auto',
          height: isHorizontal ? 'auto' : height,
        },
      }}
      {...props}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {(title || showCloseButton || showBackButton) && (
          <DrawerHeader>
            {showBackButton && (
              <IconButton onClick={onBack} size="small">
                <ArrowBack />
              </IconButton>
            )}
            
            <Box flex={1}>
              {title && (
                <Typography variant="h6" component="h2">
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>

            {showCloseButton && (
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            )}
          </DrawerHeader>
        )}
        
        <DrawerContent>
          {children}
        </DrawerContent>
      </Box>
    </MuiDrawer>
  );
});

// Popover Component
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(({
  children,
  open,
  anchorEl,
  onClose,
  anchorOrigin = { vertical: 'bottom', horizontal: 'left' },
  transformOrigin = { vertical: 'top', horizontal: 'left' },
  title,
  actions,
  maxWidth = 400,
  arrow = false,
  elevation = 8,
  className,
  ...props
}, ref) => {
  return (
    <MuiPopover
      ref={ref}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      elevation={elevation}
      className={className}
      PaperProps={{
        sx: { maxWidth },
      }}
      {...props}
    >
      <PopoverContent elevation={0}>
        {title && (
          <PopoverHeader>
            <Typography variant="subtitle1">
              {title}
            </Typography>
            {actions}
          </PopoverHeader>
        )}
        
        <Box p={2}>
          {children}
        </Box>
      </PopoverContent>
    </MuiPopover>
  );
});

// Overlay Component
export const Overlay = forwardRef<HTMLDivElement, OverlayProps>(({
  children,
  open,
  onClose,
  blur = false,
  opacity = 0.5,
  zIndex = 1300,
  closeOnClick = true,
  loading = false,
  message,
  className,
  ...props
}, ref) => {
  if (!open) return null;

  return (
    <OverlayRoot
      ref={ref}
      blur={blur}
      opacity={opacity}
      zIndex={zIndex}
      onClick={closeOnClick ? onClose : undefined}
      className={className}
      {...props}
    >
      {children || message}
    </OverlayRoot>
  );
});

// SlideOver Component (Alternative Drawer)
export const SlideOver = forwardRef<HTMLDivElement, SlideOverProps>(({
  children,
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  showCloseButton = true,
  actions,
  position = 'right',
  className,
  ...props
}, ref) => {
  return (
    <SlideOverRoot
      ref={ref}
      anchor={position}
      open={open}
      onClose={onClose}
      size={size}
      className={className}
      {...props}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <DrawerHeader>
          <Box flex={1}>
            {title && (
              <Typography variant="h6" component="h2">
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          
          {showCloseButton && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </DrawerHeader>
        
        <DrawerContent>
          {children}
        </DrawerContent>
        
        {actions && (
          <>
            <Divider />
            <DialogActionsStyled>
              {actions}
            </DialogActionsStyled>
          </>
        )}
      </Box>
    </SlideOverRoot>
  );
});

// BottomSheet Component
export const BottomSheet = forwardRef<HTMLDivElement, BottomSheetProps>(({
  children,
  open,
  onClose,
  title,
  subtitle,
  height = 'auto',
  showHandle = true,
  showCloseButton = true,
  className,
  ...props
}, ref) => {
  return (
    <BottomSheetRoot
      ref={ref}
      anchor="bottom"
      open={open}
      onClose={onClose}
      height={height}
      className={className}
      {...props}
    >
      <Box>
        {showHandle && <SheetHandle />}
        
        {(title || showCloseButton) && (
          <DrawerHeader>
            <Box flex={1}>
              {title && (
                <Typography variant="h6" component="h2">
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            
            {showCloseButton && (
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            )}
          </DrawerHeader>
        )}
        
        <DrawerContent>
          {children}
        </DrawerContent>
      </Box>
    </BottomSheetRoot>
  );
});

// Display names
Modal.displayName = 'Modal';
Dialog.displayName = 'Dialog';
Drawer.displayName = 'Drawer';
Popover.displayName = 'Popover';
Overlay.displayName = 'Overlay';
SlideOver.displayName = 'SlideOver';
BottomSheet.displayName = 'BottomSheet';

export default Modal;