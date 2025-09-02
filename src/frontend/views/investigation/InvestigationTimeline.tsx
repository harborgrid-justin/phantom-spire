/**
 * Investigation Timeline
 * Visual timeline for threat investigations and analysis
 */

import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineConnector,
  TimelineSeparator,
  TimelineDot,
  TimelineOppositeContent,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { Timeline as TimelineIcon, Security, BugReport, Analytics } from '@mui/icons-material';
import { addUIUXEvaluation } from '../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';

export const InvestigationTimeline: React.FC = () => {
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('investigation-timeline', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 180000
    });

    return () => evaluationController.remove();
  }, []);

  const timelineEvents = [
    { time: '09:15', title: 'Initial Alert', description: 'Suspicious network activity detected', type: 'alert' },
    { time: '09:32', title: 'IOC Identified', description: 'Malicious IP address confirmed', type: 'ioc' },
    { time: '10:45', title: 'Incident Created', description: 'INC-2024-0123 created for investigation', type: 'incident' },
    { time: '11:20', title: 'Analysis Complete', description: 'Threat analysis completed, APT29 suspected', type: 'analysis' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🕒 Investigation Timeline
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Visual timeline of threat investigation activities and findings.
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Timeline position="alternate">
          {timelineEvents.map((event, index) => (
            <TimelineItem key={index}>
              <TimelineOppositeContent>
                <Typography variant="body2" color="text.secondary">
                  {event.time}
                </Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color="primary">
                  {event.type === 'alert' && <Security />}
                  {event.type === 'ioc' && <Security />}
                  {event.type === 'incident' && <BugReport />}
                  {event.type === 'analysis' && <Analytics />}
                </TimelineDot>
                {index < timelineEvents.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" component="h1">
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.description}
                    </Typography>
                    <Chip size="small" label={event.type} sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Paper>
    </Box>
  );
};