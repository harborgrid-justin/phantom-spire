/**
 * FilterBar Component  
 * Search and filter controls for threat intelligence feeds
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Search as SearchIcon } from '@mui/icons-material';
import { FilterBarProps } from '../types';

export function FilterBar({
  searchTerm,
  categoryFilter,
  pricingFilter,
  onSearchChange,
  onCategoryChange,
  onPricingChange
}: FilterBarProps) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search feeds..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select 
                value={categoryFilter} 
                onChange={(e) => onCategoryChange(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="malware">Malware</MenuItem>
                <MenuItem value="phishing">Phishing</MenuItem>
                <MenuItem value="botnet">Botnet</MenuItem>
                <MenuItem value="apt">APT</MenuItem>
                <MenuItem value="vulnerability">Vulnerability</MenuItem>
                <MenuItem value="ioc">IOC</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Pricing</InputLabel>
              <Select 
                value={pricingFilter} 
                onChange={(e) => onPricingChange(e.target.value)}
                label="Pricing"
              >
                <MenuItem value="all">All Pricing</MenuItem>
                <MenuItem value="free">Free</MenuItem>
                <MenuItem value="freemium">Freemium</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <Box display="flex" justifyContent="flex-end">
              <TextField
                select
                size="small"
                label="Sort By"
                defaultValue="rating"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="rating">Rating</MenuItem>
                <MenuItem value="subscribers">Subscribers</MenuItem>
                <MenuItem value="updated">Last Updated</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </TextField>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}