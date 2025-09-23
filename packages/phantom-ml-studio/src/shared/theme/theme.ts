import { createTheme } from '@mui/material/styles'
import { colors } from './colors'
import { typography } from './typography'
import { borderRadius, shadows } from './spacing'

export const theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
  },
  typography: {
    fontFamily: typography.fontFamily,
    h1: typography.headings.h1,
    h2: typography.headings.h2,
    h3: typography.headings.h3,
    h4: typography.headings.h4,
    h5: typography.headings.h5,
    h6: typography.headings.h6,
    body1: typography.body.body1,
    body2: typography.body.body2,
    caption: typography.body.caption,
  },
  shape: {
    borderRadius: borderRadius.md,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: typography.fontWeights.medium,
          borderRadius: borderRadius.md,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: shadows.md,
          borderRadius: borderRadius.lg,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: shadows.md,
          backgroundColor: colors.background.paper,
          color: colors.text.primary,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm + 2, // 6px
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
        },
      },
    },
  },
})
