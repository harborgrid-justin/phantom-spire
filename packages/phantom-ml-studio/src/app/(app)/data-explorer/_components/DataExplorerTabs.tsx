/**
 * Data Explorer Tabs Component
 * Navigation tabs for different data views
 */

import React from 'react';
import {
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';

interface DataExplorerTabsProps {
  selectedTab: number;
  onTabChange: (newTab: number) => void;
}

export const DataExplorerTabs: React.FC<DataExplorerTabsProps> = ({
  selectedTab,
  onTabChange
}) => {
  return (
    <Card sx={{ mb: 4 }} elevation={1}>
      <CardContent sx={{ pb: 1 }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => onTabChange(newValue)}>
          <Tab label="Overview" />
          <Tab label="Columns" />
          <Tab label="Sample Data" />
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataExplorerTabs;
