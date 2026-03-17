import React, { useState } from 'react';
import './UploadModal.css';

const UploadModal = ({ onClose, onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024 * 1024) { // 100GB limit
        alert('File size must be less than 100GB');
        return;
      }
      setSelectedFile(file);
      setSuccess(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Import the combined file service
      const { handleUpload: uploadFile } = await import('../services/fileService');
      const { getCurrentUser } = await import('../services/authService');
      
      // Get current user
      const user = getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Upload file with progress tracking
      const result = await uploadFile(selectedFile, user.email, (progress) => {
        setUploadProgress(progress);
      });

      console.log("✅ Upload successful:", result);

      // Create file object for UI
      const newFile = {
        fileId: result.data.fileId,
        fileName: result.data.fileName,
        fileSize: result.data.fileSize,
        s3Key: result.data.s3Key,
        fileUrl: result.data.url,
        uploadTime: new Date().toISOString()
      };

      setSuccess(true);
      setTimeout(() => {
        onUploadComplete(newFile);
      }, 1500);

    } catch (error) {
      console.error('❌ Upload error:', error);
      alert(`Upload failed: ${error.message}`);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024 * 1024) {
        alert('File size must be less than 100GB');
        return;
      }
      setSelectedFile(file);
      setSuccess(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📤 Upload File</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {!selectedFile ? (
            <div 
              className="upload-zone"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="upload-icon">📁</div>
              <p className="upload-text">Drag & drop your file here</p>
              <p className="upload-subtext">or</p>
              <label className="btn-select-file">
                Choose File
                <input
                  type="file"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </label>
              <p className="upload-info">Maximum file size: 100GB</p>
            </div>
          ) : (
            <div className="file-preview">
              {!success ? (
                <>
                  <div className="file-info">
                    <div className="file-icon">📄</div>
                    <div className="file-details">
                      <p className="file-name">{selectedFile.name}</p>
                      <p className="file-size">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>

                  {uploading && (
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="progress-text">{uploadProgress}%</p>
                    </div>
                  )}

                  <div className="modal-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => setSelectedFile(null)}
                      disabled={uploading}
                    >
                      Change File
                    </button>
                    <button 
                      className="btn-upload-action"
                      onClick={handleUpload}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="success-state">
                  <div className="success-icon">✓</div>
                  <h3>Upload Successful!</h3>
                  <p>Your file has been encrypted and uploaded securely</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
