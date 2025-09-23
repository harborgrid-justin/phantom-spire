/**
 * Centralized Path Configuration
 * Contains all application routes and external URLs as constants
 */

// ============================================================================
// CORE APPLICATION PATHS
// ============================================================================

export const PATHS = {
  // Root and main navigation
  HOME: '/',
  DASHBOARD: '/dashboard',

  // ML Core Features
  MODELS: '/models',
  MODEL_BUILDER: '/modelBuilder',
  TRAINING: '/training',
  DATASETS: '/datasets',
  DATA_EXPLORER: '/dataExplorer',
  EXPERIMENTS: '/experiments',

  // Security & Intelligence
  THREAT_INTELLIGENCE: '/threatIntelligence',
  COMPLIANCE: '/compliance',
  MONITORING: '/monitoring',

  // Settings & Configuration
  SETTINGS: '/settings',

  // Project-specific dynamic routes
  PROJECT_DETAIL: (projectId: string) => `/projects/${projectId}`,
  PROJECT_MODEL_DETAIL: (projectId: string, modelId: string) =>
    `/projects/${projectId}/models/${modelId}`,

  // Phantom Cores
  PHANTOM_CORES: '/phantom-cores',
  PHANTOM_CORES_OVERVIEW: '/phantom-cores-overview',
  PHANTOM_CORE_DETAIL: (corePath: string) => `/phantom-cores/${corePath}`,

  // Enhanced features
  ENHANCED_NAVIGATION: '/enhanced-navigation',
  DEPLOYMENTS: '/deployments',
} as const;

// ============================================================================
// AUTHENTICATION & USER MANAGEMENT
// ============================================================================

export const AUTH_PATHS = {
  LOGIN: '/auth/login',
  LOGIN_ALT: '/login',
  LOGIN_V2: '/auth/login2',
  REGISTER: '/auth/register',
  REGISTER_V2: '/auth/register2',
  FORGOT_PASSWORD: '/auth/forgot-password',
  FORGOT_PASSWORD_V2: '/auth/forgot-password2',
  TWO_STEP: '/auth/two-steps',
  TWO_STEP_V2: '/auth/two-steps2',
  MAINTENANCE: '/auth/maintenance',
  USER_PROFILE: '/user-profile',
} as const;

// ============================================================================
// BLOG & MARKETING CONTENT
// ============================================================================

export const CONTENT_PATHS = {
  BLOG: '/blog',
  BLOG_ROOT: '/frontend-pages/blog',
  BLOG_DETAIL: '/frontend-pages/blog/detail/streaming-video-way-before-it-was-cool-go-dark-tomorrow',
  BLOG_TRENDS: '/blog/2024/machine-learning-trends',
  BLOG_TUTORIAL: '/blog/tutorials/getting-started',

  // Marketing pages
  HOMEPAGE: '/frontend-pages/homepage',
  ABOUT: '/frontend-pages/about',
  CONTACT: '/frontend-pages/contact',
  PORTFOLIO: '/frontend-pages/portfolio',
  PRICING: '/frontend-pages/pricing',
  LANDING_PAGE: '/landingpage',
} as const;

// ============================================================================
// APPLICATION MODULES
// ============================================================================

export const APP_PATHS = {
  // Communication
  CONTACTS: '/apps/contacts',
  CHATS: '/apps/chats',
  EMAIL: '/apps/email',

  // Productivity
  NOTES: '/apps/notes',
  CALENDAR: '/apps/calendar',
  TICKETS: '/apps/tickets',
  KANBAN: '/apps/kanban',

  // E-commerce
  ECOMMERCE_ROOT: '/apps/ecommerce',
  ECOMMERCE_SHOP: '/apps/ecommerce/shop',
  ECOMMERCE_DETAIL: (id: string) => `/apps/ecommerce/detail/${id}`,
  ECOMMERCE_PRODUCT_LIST: '/apps/ecommerce/eco-product-list',
  ECOMMERCE_CHECKOUT: '/apps/ecommerce/eco-checkout',
  ECOMMERCE_ADD_PRODUCT: '/apps/ecommerce/add-product',
  ECOMMERCE_EDIT_PRODUCT: '/apps/ecommerce/edit-product',

  // Invoice management
  INVOICE_LIST: '/apps/invoice/list',
  INVOICE_DETAIL: (id: string) => `/apps/invoice/detail/${id}`,
  INVOICE_CREATE: '/apps/invoice/create',
  INVOICE_EDIT: (id: string) => `/apps/invoice/edit/${id}`,

  // Social features
  FOLLOWERS: '/apps/followers',
  FRIENDS: '/apps/friends',
  GALLERY: '/apps/gallery',
} as const;

// ============================================================================
// DASHBOARD VARIANTS
// ============================================================================

export const DASHBOARD_PATHS = {
  MODERN: '/dashboards/modern',
  ECOMMERCE: '/dashboards/ecommerce',
} as const;

// ============================================================================
// UI COMPONENTS & DEVELOPMENT
// ============================================================================

export const UI_PATHS = {
  // Form components
  FORMS_AUTOCOMPLETE: '/forms/form-elements/autocomplete',
  FORMS_BUTTON: '/forms/form-elements/button',
  FORMS_CHECKBOX: '/forms/form-elements/checkbox',
  FORMS_RADIO: '/forms/form-elements/radio',
  FORMS_DATE_TIME: '/forms/form-elements/date-time',
  FORMS_SLIDER: '/forms/form-elements/slider',
  FORMS_SWITCH: '/forms/form-elements/switch',

  // Form layouts
  FORMS_LAYOUTS: '/forms/form-layouts',
  FORMS_HORIZONTAL: '/forms/form-horizontal',
  FORMS_VERTICAL: '/forms/form-vertical',
  FORMS_CUSTOM: '/forms/form-custom',
  FORMS_WIZARD: '/forms/form-wizard',
  FORMS_VALIDATION: '/forms/form-validation',
  FORMS_TIPTAP: '/forms/form-tiptap',

  // UI Components
  UI_ALERT: '/ui-components/alert',
  UI_ACCORDION: '/ui-components/accordion',
  UI_AVATAR: '/ui-components/avatar',
  UI_CHIP: '/ui-components/chip',
  UI_DIALOG: '/ui-components/dialog',
  UI_LIST: '/ui-components/list',
  UI_POPOVER: '/ui-components/popover',
  UI_RATING: '/ui-components/rating',
  UI_TABS: '/ui-components/tabs',
  UI_TOOLTIP: '/ui-components/tooltip',
  UI_TRANSFER_LIST: '/ui-components/transfer-list',
  UI_TYPOGRAPHY: '/ui-components/typography',

  // Widgets
  WIDGETS_CARDS: '/widgets/cards',
  WIDGETS_BANNERS: '/widgets/banners',
  WIDGETS_CHARTS: '/widgets/charts',
} as const;

// ============================================================================
// TABLES & DATA DISPLAY
// ============================================================================

export const TABLE_PATHS = {
  // Basic tables
  BASIC: '/tables/basic',
  COLLAPSIBLE: '/tables/collapsible',
  ENHANCED: '/tables/enhanced',
  FIXED_HEADER: '/tables/fixed-header',
  PAGINATION: '/tables/pagination',
  SEARCH: '/tables/search',

  // React tables
  REACT_BASIC: '/react-tables/basic',
  REACT_DENSE: '/react-tables/dense',
  REACT_FILTER: '/react-tables/filter',
  REACT_ROW_SELECTION: '/react-tables/row-selection',
  REACT_PAGINATION: '/react-tables/pagination',
  REACT_SORTING: '/react-tables/sorting',
  REACT_COLUMN_VISIBILITY: '/react-tables/column-visiblity',
  REACT_EDITABLE: '/react-tables/editable',
  REACT_EXPANDING: '/react-tables/expanding',
  REACT_STICKY: '/react-tables/sticky',
  REACT_EMPTY: '/react-tables/empty',
  REACT_DRAG_DROP: '/react-tables/drag-drop',
} as const;

// ============================================================================
// CHARTS & VISUALIZATION
// ============================================================================

export const CHART_PATHS = {
  // MUI Charts
  MUI_BAR: '/muicharts/barcharts',
  MUI_LINE: '/muicharts/linecharts/line',
  MUI_AREA: '/muicharts/linecharts/area',
  MUI_PIE: '/muicharts/piecharts',
  MUI_SCATTER: '/muicharts/scattercharts',
  MUI_SPARKLINE: '/muicharts/sparklinecharts',
  MUI_GAUGE: '/muicharts/gaugecharts',

  // ApexCharts
  APEX_LINE: '/charts/line-chart',
  APEX_GRADIENT: '/charts/gredient-chart',
  APEX_AREA: '/charts/area-chart',
  APEX_CANDLESTICK: '/charts/candlestick-chart',
  APEX_COLUMN: '/charts/column-chart',
  APEX_DOUGHNUT: '/charts/doughnut-pie-chart',
  APEX_RADIAL: '/charts/radialbar-chart',
} as const;

// ============================================================================
// TREE COMPONENTS
// ============================================================================

export const TREE_PATHS = {
  SIMPLE_ITEMS: '/mui-trees/simpletree/simpletree-items',
  SIMPLE_SELECTION: '/mui-trees/simpletree/simpletree-selection',
  SIMPLE_EXPANSION: '/mui-trees/simpletree/simpletree-expansion',
  SIMPLE_CUSTOMIZATION: '/mui-trees/simpletree/simpletree-customization',
  SIMPLE_FOCUS: '/mui-trees/simpletree/simpletree-focus',
} as const;

// ============================================================================
// UTILITY & ERROR PAGES
// ============================================================================

export const UTILITY_PATHS = {
  PRICING: '/pages/pricing',
  ACCOUNT_SETTINGS: '/pages/account-settings',
  FAQ: '/pages/faq',
  ERROR_400: '/400',

  // Menu levels (for testing)
  MENU_LEVEL: '/menulevel',
  MENU_L1: '/l1',
  MENU_L1_1: '/l1.1',
  MENU_L2: '/l2',
  MENU_L2_1: '/l2.1',
  MENU_L3: '/l3',
  MENU_L3_1: '/l3.1',
} as const;

// ============================================================================
// EXTERNAL URLS
// ============================================================================

export const EXTERNAL_URLS = {
  // Documentation & Support
  DOCS: 'https://docs.phantom-spire.com',
  SUPPORT: 'https://adminmart.com/support',
  PURCHASE: 'https://adminmart.com/purchase/',
  ADMINMART: 'https://adminmart.com/',

  // Social & Code
  GITHUB: 'https://github.com/phantom-spire',
  TWITTER: 'https://twitter.com/phantom_spire',

  // Component driven development
  COMPONENT_DRIVEN: 'https://componentdriven.org',
  STORYBOOK_TUTORIALS: 'https://storybook.js.org/tutorials/',
  STORYBOOK_DOCS: 'https://storybook.js.org/docs',
} as const;

// ============================================================================
// ROUTE UTILITIES
// ============================================================================

/**
 * Check if a path is external (starts with http)
 */
export const isExternalUrl = (path: string): boolean => {
  return path.startsWith('http://') || path.startsWith('https://');
};

/**
 * Check if a path is resource-heavy (for prefetch control)
 */
export const isResourceHeavyPath = (path: string): boolean => {
  const resourceHeavyPaths = [
    PATHS.TRAINING,
    PATHS.DATASETS,
    PATHS.DATA_EXPLORER,
    PATHS.DEPLOYMENTS,
    PATHS.MONITORING,
    PATHS.THREAT_INTELLIGENCE,
    CHART_PATHS.MUI_BAR,
    CHART_PATHS.MUI_LINE,
    CHART_PATHS.MUI_AREA,
    CHART_PATHS.APEX_LINE,
  ];

  return resourceHeavyPaths.includes(path);
};

/**
 * Get all navigation items for the main app
 */
export const getMainNavigationItems = () => [
  {
    title: 'Home',
    href: PATHS.HOME,
    description: 'Platform overview and quick access',
    isResourceHeavy: false
  },
  {
    title: 'Dashboard',
    href: PATHS.DASHBOARD,
    description: 'ML operations dashboard and monitoring',
    isResourceHeavy: false
  },
  {
    title: 'Models',
    href: PATHS.MODELS,
    description: 'Model management and deployment',
    isResourceHeavy: false
  },
  {
    title: 'Training',
    href: PATHS.TRAINING,
    description: 'Model training and optimization',
    isResourceHeavy: true
  },
  {
    title: 'Datasets',
    href: PATHS.DATASETS,
    description: 'Data management and preprocessing',
    isResourceHeavy: true
  },
  {
    title: 'Experiments',
    href: PATHS.EXPERIMENTS,
    description: 'Experiment tracking and comparison',
    isResourceHeavy: false
  }
];

// Type exports for better TypeScript support
export type PathValue = typeof PATHS[keyof typeof PATHS];
export type AuthPathValue = typeof AUTH_PATHS[keyof typeof AUTH_PATHS];
export type ExternalUrlValue = typeof EXTERNAL_URLS[keyof typeof EXTERNAL_URLS];