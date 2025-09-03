'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api';
import { useServicePage } from '../../lib/business-logic';
import { Evidence } from '../../types/api';

export default function EvidencePage() {
  // Business Logic Integration
  const {
    loading: businessLoading,
    data: businessData,
    error: businessError,
    stats,
    connected,
    notifications,
    execute,
    refresh,
    addNotification,
    removeNotification
  } = useServicePage('evidence');

  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');

  useEffect(() => {
    fetchEvidence();
  }, []);

  const fetchEvidence = async () => {
    try {
      setLoading(true);
      
      // Use business logic first
      const businessResponse = await execute('getEvidence', {});
      
      if (businessResponse.success && businessResponse.data) {
        setEvidence(businessResponse.data);
        addNotification('success', 'Evidence loaded successfully via business logic');
      } else {
        // Fallback to direct API
        const response = await apiClient.getEvidence();
        if (response.data && Array.isArray(response.data)) {
          setEvidence(response.data);
          addNotification('info', 'Evidence loaded via direct API (business logic unavailable)');
        } else if (response.error) {
          setError(response.error);
          addNotification('error', `Failed to load evidence: ${response.error}`);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch evidence';
      setError(errorMsg);
      addNotification('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      // Use business logic for upload
      const uploadResponse = await execute('uploadEvidence', {
        fileName: uploadFile.name,
        fileType: uploadFile.type,
        fileSize: uploadFile.size,
        description: uploadDescription || uploadFile.name
      });

      if (uploadResponse.success) {
        addNotification('success', `Evidence "${uploadFile.name}" uploaded successfully`);
        
        // Add to local state
        const newEvidence: Evidence = {
          id: uploadResponse.data?.id || String(evidence.length + 1),
          type: uploadFile.type || 'file',
          description: uploadDescription || uploadFile.name,
          filePath: uploadResponse.data?.filePath || `/uploads/${uploadFile.name}`,
          metadata: {
            fileName: uploadFile.name,
            fileSize: uploadFile.size,
            fileType: uploadFile.type,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setEvidence([...evidence, newEvidence]);
      } else {
        addNotification('error', `Upload failed: ${uploadResponse.error}`);
        
        // Fallback to mock functionality
        const newEvidence: Evidence = {
          id: String(evidence.length + 1),
          type: uploadFile.type || 'file',
          description: uploadDescription || uploadFile.name,
          filePath: `/uploads/${uploadFile.name}`,
          metadata: {
            fileName: uploadFile.name,
            fileSize: uploadFile.size,
            fileType: uploadFile.type,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setEvidence([...evidence, newEvidence]);
        addNotification('info', 'Evidence added locally (business logic unavailable)');
      }
    } catch (error) {
      addNotification('error', 'Upload operation failed');
    }

    setShowUploadForm(false);
    setUploadFile(null);
    setUploadDescription('');
  };

  const getFileTypeIcon = (type: string) => {
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('video')) return '🎥';
    if (type.includes('audio')) return '🎵';
    if (type.includes('text')) return '📝';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading evidence...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Business Logic Status */}
      <div className="mb-4">
        <div className="flex items-center space-x-4 text-sm">
          <div className={`flex items-center ${connected ? 'text-green-600' : 'text-gray-500'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            {connected ? 'Business Logic Connected' : 'Business Logic Offline'}
          </div>
          {stats && (
            <div className="text-gray-600">
              Service Stats: {stats.totalRequests || 0} requests
            </div>
          )}
          <button
            onClick={refresh}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Business Logic Notifications */}
      {notifications.length > 0 && (
        <div className="mb-6">
          <div className="space-y-2">
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-md flex justify-between items-center ${
                  notification.type === 'error' ? 'bg-red-100 border border-red-200 text-red-800' :
                  notification.type === 'warning' ? 'bg-yellow-100 border border-yellow-200 text-yellow-800' :
                  notification.type === 'success' ? 'bg-green-100 border border-green-200 text-green-800' :
                  'bg-blue-100 border border-blue-200 text-blue-800'
                }`}
              >
                <div className="text-sm">
                  {notification.message}
                  <span className="text-xs opacity-75 ml-2">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="ml-4 text-xs opacity-50 hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Evidence Management
          </h1>
          <p className="text-gray-600">
            Store and manage digital evidence and forensic artifacts
          </p>
        </div>
        <button
          onClick={() => setShowUploadForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Upload Evidence
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
          <br />
          <small>Make sure the backend server is running and accessible.</small>
        </div>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Upload Evidence</h2>
            <form onSubmit={handleUploadSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Describe the evidence..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={!uploadFile}
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evidence Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">
            {evidence.length}
          </div>
          <div className="text-sm text-gray-600">Total Evidence</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {evidence.filter(e => e.type.includes('image')).length}
          </div>
          <div className="text-sm text-gray-600">Images</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {evidence.filter(e => e.type.includes('pdf') || e.type.includes('text')).length}
          </div>
          <div className="text-sm text-gray-600">Documents</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-orange-600">
            {evidence.filter(e => e.type.includes('video') || e.type.includes('audio')).length}
          </div>
          <div className="text-sm text-gray-600">Media Files</div>
        </div>
      </div>

      {/* Evidence List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {evidence.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-lg font-medium mb-2">No Evidence Found</h3>
            <p>Start by uploading your first piece of digital evidence.</p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Evidence
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {evidence.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">
                      {getFileTypeIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {item.metadata?.fileName || 'Unknown File'}
                      </h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.type}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {item.description}
                </p>
                
                <div className="space-y-1 text-xs text-gray-500">
                  {item.metadata?.fileSize && (
                    <div>Size: {formatFileSize(Number(item.metadata.fileSize))}</div>
                  )}
                  <div>Created: {new Date(item.createdAt).toLocaleDateString()}</div>
                  {item.filePath && (
                    <div className="truncate">Path: {item.filePath}</div>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button className="flex-1 text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors">
                      View
                    </button>
                    <button className="flex-1 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                      Download
                    </button>
                    <button className="flex-1 text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
