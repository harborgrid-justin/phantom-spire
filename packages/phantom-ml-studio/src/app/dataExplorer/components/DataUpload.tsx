'use client';

import React, { useCallback, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  CloudUploadOutlined as DragDropIcon
} from '@mui/icons-material';
import { Dataset } from '@/services/data-explorer';

interface DataUploadProps {
  onDatasetUploaded: (dataset: Dataset) => void;
}

const DataUpload: React.FC<DataUploadProps> = ({ onDatasetUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Upload handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    setUploadedFile(file);
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setUploadError('Unsupported file format. Please upload a CSV file.');
      setUploading(false);
      return;
    }

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadProgress(100);
      setUploadSuccess(true);
      
      // Create new dataset object
      const newDataset: Dataset = {
        id: Date.now(),
        name: file.name.replace('.csv', ''),
        rows: 100,
        columns: 5,
        type: 'csv',
        uploaded: new Date().toISOString()
      };
      
      onDatasetUploaded(newDataset);
      
    } catch (error) {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      clearInterval(progressInterval);
    }
  }, [onDatasetUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  return (
    <Card sx={{ mb: 4 }} elevation={2}>
      <CardContent>
        <Box
          data-cy="upload-area"
          sx={{
            border: `2px dashed ${dragOver ? '#1976d2' : '#ccc'}`,
            borderRadius: 2,
            p: 6,
            textAlign: 'center',
            bgcolor: dragOver ? 'action.hover' : 'background.default',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out'
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Box data-cy="form-upload-dropzone" sx={{ width: '100%', height: '100%' }}>
            <DragDropIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom data-cy="upload-instructions">
              Drag and drop your CSV file here
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              or click to browse files
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supported formats: CSV files up to 100MB
            </Typography>
          </Box>
        </Box>

        {/* Upload Progress */}
        {uploading && (
          <Box sx={{ mt: 3 }} data-cy="upload-progress">
            <Typography variant="body2" gutterBottom>
              Uploading {uploadedFile?.name}...
            </Typography>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              data-cy="upload-progress-bar"
              aria-valuenow={uploadProgress}
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              {Math.round(uploadProgress)}% complete
            </Typography>
          </Box>
        )}

        {/* Upload Success */}
        {uploadSuccess && (
          <Alert severity="success" sx={{ mt: 3 }} data-cy="upload-success">
            Dataset uploaded successfully!
          </Alert>
        )}

        {/* Upload Error */}
        {uploadError && (
          <Alert severity="error" sx={{ mt: 3 }} data-cy="upload-error">
            <Typography data-cy="error-message">{uploadError}</Typography>
            <Button
              color="inherit"
              size="small"
              sx={{ mt: 1 }}
              data-cy="error-retry"
              onClick={() => {
                setUploadError(null);
                if (uploadedFile) {
                  void handleFileUpload(uploadedFile);
                }
              }}
            >
              Try Again
            </Button>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DataUpload;
