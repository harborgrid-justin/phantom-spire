/**
 * Threat Data Marketplace
 * Commercial and premium threat intelligence marketplace platform
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Rating,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
  Badge,
  CardActions
} from '@mui/material';
import { 
  Store, 
  AttachMoney, 
  Security, 
  Star,
  Search,
  ShoppingCart,
  Download,
  Verified,
  TrendingUp,
  Assessment,
  Payment,
  Preview,
  FilterList,
  Category,
  Schedule,
  ThumbUp
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../../services/business-logic/hooks/useBusinessLogic';

interface ThreatProduct {
  id: string;
  name: string;
  vendor: string;
  category: 'IOC' | 'Malware Analysis' | 'Attribution' | 'Feeds' | 'Reports' | 'Tools';
  price: number;
  priceType: 'one-time' | 'monthly' | 'yearly' | 'per-query';
  rating: number;
  reviews: number;
  description: string;
  features: string[];
  updateFrequency: 'Real-time' | 'Hourly' | 'Daily' | 'Weekly' | 'On-demand';
  dataVolume: string;
  coverage: string[];
  isVerified: boolean;
  isTrending: boolean;
  previewAvailable: boolean;
  vendorTier: 'premium' | 'standard' | 'community';
}

interface Purchase {
  id: string;
  productId: string;
  productName: string;
  vendor: string;
  purchaseDate: string;
  amount: number;
  status: 'active' | 'expired' | 'cancelled';
  renewalDate?: string;
  downloads: number;
  apiCalls: number;
}

interface VendorProfile {
  id: string;
  name: string;
  tier: 'premium' | 'standard' | 'community';
  products: number;
  rating: number;
  description: string;
  specialties: string[];
  verified: boolean;
  joinedDate: string;
}

export const ThreatDataMarketplace: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('threat-marketplace');

  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ThreatProduct | null>(null);

  const [threatProducts, setThreatProducts] = useState<ThreatProduct[]>([
    {
      id: 'product-001',
      name: 'APT Intelligence Premium Feed',
      vendor: 'CyberThreat Analytics',
      category: 'Feeds',
      price: 2500,
      priceType: 'monthly',
      rating: 4.8,
      reviews: 127,
      description: 'Comprehensive APT group intelligence with real-time updates and attribution data',
      features: ['Real-time updates', 'Attribution analysis', 'TTPs mapping', 'IOC enrichment'],
      updateFrequency: 'Real-time',
      dataVolume: '10,000+ indicators/month',
      coverage: ['APT groups', 'Campaign tracking', 'Infrastructure analysis'],
      isVerified: true,
      isTrending: true,
      previewAvailable: true,
      vendorTier: 'premium'
    },
    {
      id: 'product-002',
      name: 'Malware Family Analysis Suite',
      vendor: 'SecureLogic Research',
      category: 'Malware Analysis',
      price: 150,
      priceType: 'per-query',
      rating: 4.6,
      reviews: 89,
      description: 'Deep malware analysis with family classification and behavior profiles',
      features: ['Automated analysis', 'Family classification', 'YARA rules', 'Sandbox reports'],
      updateFrequency: 'On-demand',
      dataVolume: 'Unlimited queries',
      coverage: ['Windows malware', 'Mobile threats', 'Linux/Unix variants'],
      isVerified: true,
      isTrending: false,
      previewAvailable: true,
      vendorTier: 'premium'
    },
    {
      id: 'product-003',
      name: 'Financial Fraud Indicators',
      vendor: 'FinSec Intelligence',
      category: 'IOC',
      price: 800,
      priceType: 'monthly',
      rating: 4.4,
      reviews: 156,
      description: 'Specialized IOCs for financial fraud and banking trojans',
      features: ['Banking trojan IOCs', 'Fraud indicators', 'Payment system threats', 'Mobile banking'],
      updateFrequency: 'Hourly',
      dataVolume: '5,000+ IOCs/month',
      coverage: ['Banking trojans', 'Card skimmers', 'Fraud domains'],
      isVerified: true,
      isTrending: false,
      previewAvailable: false,
      vendorTier: 'standard'
    },
    {
      id: 'product-004',
      name: 'Open Source Threat Intel',
      vendor: 'Community Collective',
      category: 'Reports',
      price: 0,
      priceType: 'one-time',
      rating: 4.1,
      reviews: 234,
      description: 'Community-driven threat intelligence reports and analysis',
      features: ['Community reports', 'OSINT analysis', 'Collaborative research', 'Free access'],
      updateFrequency: 'Weekly',
      dataVolume: '100+ reports/month',
      coverage: ['Emerging threats', 'Regional campaigns', 'Research papers'],
      isVerified: false,
      isTrending: true,
      previewAvailable: true,
      vendorTier: 'community'
    }
  ]);

  const [myPurchases, setMyPurchases] = useState<Purchase[]>([
    {
      id: 'purchase-001',
      productId: 'product-001',
      productName: 'APT Intelligence Premium Feed',
      vendor: 'CyberThreat Analytics',
      purchaseDate: '2024-01-01T00:00:00Z',
      amount: 2500,
      status: 'active',
      renewalDate: '2024-02-01T00:00:00Z',
      downloads: 1247,
      apiCalls: 8900
    },
    {
      id: 'purchase-002',
      productId: 'product-003',
      productName: 'Financial Fraud Indicators',
      vendor: 'FinSec Intelligence',
      purchaseDate: '2023-12-15T00:00:00Z',
      amount: 800,
      status: 'active',
      renewalDate: '2024-01-15T00:00:00Z',
      downloads: 567,
      apiCalls: 3400
    }
  ]);

  const [topVendors, setTopVendors] = useState<VendorProfile[]>([
    {
      id: 'vendor-001',
      name: 'CyberThreat Analytics',
      tier: 'premium',
      products: 12,
      rating: 4.8,
      description: 'Leading provider of APT intelligence and attribution analysis',
      specialties: ['APT Analysis', 'Attribution', 'Campaign Tracking'],
      verified: true,
      joinedDate: '2022-03-15'
    },
    {
      id: 'vendor-002',
      name: 'SecureLogic Research',
      tier: 'premium',
      products: 8,
      rating: 4.6,
      description: 'Specialized malware analysis and reverse engineering services',
      specialties: ['Malware Analysis', 'Reverse Engineering', 'YARA Rules'],
      verified: true,
      joinedDate: '2022-08-20'
    },
    {
      id: 'vendor-003',
      name: 'FinSec Intelligence',
      tier: 'standard',
      products: 5,
      rating: 4.4,
      description: 'Financial sector threat intelligence specialists',
      specialties: ['Financial Threats', 'Banking Security', 'Fraud Detection'],
      verified: true,
      joinedDate: '2023-01-10'
    }
  ]);

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('threat-marketplace', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 180000
    });

    return () => evaluationController.remove();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'warning';
      case 'standard': return 'info';
      case 'community': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const formatPrice = (price: number, priceType: string) => {
    if (price === 0) return 'Free';
    const formatted = price.toLocaleString();
    switch (priceType) {
      case 'monthly': return `$${formatted}/month`;
      case 'yearly': return `$${formatted}/year`;
      case 'per-query': return `$${formatted}/query`;
      default: return `$${formatted}`;
    }
  };

  const filteredProducts = threatProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    const matchesPrice = priceFilter === 'All' || 
                        (priceFilter === 'Free' && product.price === 0) ||
                        (priceFilter === 'Paid' && product.price > 0);
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Store color="primary" />
        🛒 Threat Data Marketplace
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Discover and purchase premium threat intelligence products, feeds, and analysis tools from verified vendors.
      </Typography>

      {/* Marketplace Statistics */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Marketplace:</strong> 156 products available • 47 verified vendors • $2.3M in transactions this month
        </Typography>
      </Alert>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary">
          <Tab label="Browse Products" />
          <Tab label="My Purchases" />
          <Tab label="Top Vendors" />
          <Tab label="Trending" />
        </Tabs>
      </Paper>

      {/* Browse Products Tab */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {/* Search and Filters */}
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={categoryFilter}
                      label="Category"
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Categories</MenuItem>
                      <MenuItem value="IOC">IOC</MenuItem>
                      <MenuItem value="Malware Analysis">Malware Analysis</MenuItem>
                      <MenuItem value="Attribution">Attribution</MenuItem>
                      <MenuItem value="Feeds">Feeds</MenuItem>
                      <MenuItem value="Reports">Reports</MenuItem>
                      <MenuItem value="Tools">Tools</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Price</InputLabel>
                    <Select
                      value={priceFilter}
                      label="Price"
                      onChange={(e) => setPriceFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Prices</MenuItem>
                      <MenuItem value="Free">Free</MenuItem>
                      <MenuItem value="Paid">Paid</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterList />}
                  >
                    More Filters
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Product Grid */}
            <Grid container spacing={3}>
              {filteredProducts.map((product) => (
                <Grid item xs={12} md={6} lg={4} key={product.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="h3">
                          {product.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {product.isVerified && (
                            <Verified color="success" fontSize="small" />
                          )}
                          {product.isTrending && (
                            <TrendingUp color="warning" fontSize="small" />
                          )}
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        by {product.vendor}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Rating value={product.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="caption">
                          ({product.reviews} reviews)
                        </Typography>
                        <Chip 
                          label={product.vendorTier} 
                          color={getTierColor(product.vendorTier)}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {product.description}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Chip label={product.category} size="small" variant="outlined" sx={{ mr: 0.5 }} />
                        <Chip label={product.updateFrequency} size="small" variant="outlined" />
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Volume: {product.dataVolume}
                      </Typography>
                      
                      <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                        {formatPrice(product.price, product.priceType)}
                      </Typography>
                      
                      <List dense sx={{ mb: 1 }}>
                        {product.features.slice(0, 3).map((feature, index) => (
                          <ListItem key={index} sx={{ py: 0, px: 0 }}>
                            <ListItemText 
                              primary={
                                <Typography variant="caption" color="textSecondary">
                                  • {feature}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                    
                    <CardActions>
                      <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
                        {product.previewAvailable && (
                          <Button 
                            size="small" 
                            variant="outlined" 
                            startIcon={<Preview />}
                            onClick={() => {
                              setSelectedProduct(product);
                              setPreviewOpen(true);
                            }}
                          >
                            Preview
                          </Button>
                        )}
                        <Button 
                          size="small" 
                          variant="contained" 
                          startIcon={product.price === 0 ? <Download /> : <ShoppingCart />}
                          sx={{ flexGrow: 1 }}
                        >
                          {product.price === 0 ? 'Download' : 'Purchase'}
                        </Button>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* My Purchases Tab */}
      {currentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                My Active Subscriptions
              </Typography>
              <List>
                {myPurchases.map((purchase) => (
                  <ListItem key={purchase.id} divider>
                    <ListItemIcon>
                      <ShoppingCart color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{purchase.productName}</Typography>
                          <Chip 
                            label={purchase.status} 
                            color={getStatusColor(purchase.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Vendor: {purchase.vendor} • Amount: ${purchase.amount.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Purchased: {new Date(purchase.purchaseDate).toLocaleDateString()}
                            {purchase.renewalDate && ` • Renews: ${new Date(purchase.renewalDate).toLocaleDateString()}`}
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" color="textSecondary">
                              Downloads: {purchase.downloads.toLocaleString()} • API calls: {purchase.apiCalls.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button variant="outlined" size="small">
                        Manage
                      </Button>
                      <Button variant="outlined" startIcon={<Download />} size="small">
                        Access
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Spending Summary
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      This Month
                    </Typography>
                    <Typography variant="h4" color="primary">
                      $3,300
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Active Subscriptions
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      2
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Total Downloads
                    </Typography>
                    <Typography variant="h4" color="info.main">
                      1,814
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Product Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Product Preview: {selectedProduct?.name}
        </DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body1">
                {selectedProduct.description}
              </Typography>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Features:
                </Typography>
                <List>
                  {selectedProduct.features.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Sample Data:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    // Sample threat intelligence data preview
                    {JSON.stringify({
                      indicators: ["192.168.1.100", "malicious-domain.com"],
                      confidence: 85,
                      tags: ["apt29", "banking-trojan"],
                      timestamp: "2024-01-15T10:30:00Z"
                    }, null, 2)}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<ShoppingCart />}>
            Purchase Now
          </Button>
        </DialogActions>
      </Dialog>

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