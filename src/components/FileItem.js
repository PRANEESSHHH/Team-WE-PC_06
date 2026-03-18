import React, { useState } from 'react';
import './FileItem.css';
import MediaViewer from './MediaViewer';

const FileItem = ({ file, onDelete }) => {
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en', { month: 'short' });
    return `${day} ${month}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      txt: '📝',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      webp: '🖼️',
      mp4: '🎥',
      mov: '🎥',
      avi: '🎥',
      mp3: '🎵',
      wav: '🎵',
      zip: '📦',
      rar: '📦',
      '7z': '📦',
      xlsx: '📊',
      xls: '📊',
      csv: '📊',
      pptx: '📊',
      ppt: '📊',
    };
    return iconMap[ext] || '📎';
  };

  const isMediaFile = () => {
    const ext = file.fileName.split('.').pop().toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
    return imageExts.includes(ext) || videoExts.includes(ext);
  };

  const handleView = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const { handleGetDownloadUrl } = await import('../services/fileService');
      const url = await handleGetDownloadUrl(file.fileId);
      setFileUrl(url);
      
      // If it's an image or video, show in media viewer
      if (isMediaFile()) {
        setShowMediaViewer(true);
      } else {
        // For other files, open in new tab
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Failed to view file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseViewer = () => {
    setShowMediaViewer(false);
    setFileUrl(null);
  };

  const handleDelete = () => {
    onDelete(file.fileId);
  };

  return (
    <>
      <div className="file-item">
        <div className="file-item-content">
          <div className="file-name-section">
            <span className="file-icon">{getFileIcon(file.fileName)}</span>
            <div className="file-info-mobile">
              <span className="file-name">{file.fileName}</span>
              <span className="file-meta">
                {formatDate(file.uploadTime)} • {formatFileSize(file.fileSize)}
              </span>
            </div>
          </div>
          
          <div className="file-date">
            {formatDate(file.uploadTime)}
          </div>
          
          <div className="file-size">
            {formatFileSize(file.fileSize)}
          </div>
          
          <div className="file-actions">
            <button 
              className="btn-action btn-view"
              onClick={handleView}
              disabled={loading}
              title="View/Download"
            >
              {loading ? '⏳' : '👁️'} {loading ? 'Loading...' : 'View'}
            </button>
            <button 
              className="btn-action btn-delete"
              onClick={handleDelete}
              title="Delete"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      {/* Media Viewer Modal */}
      {showMediaViewer && fileUrl && (
        <MediaViewer 
          file={file}
          fileUrl={fileUrl}
          onClose={handleCloseViewer}
        />
      )}
    </>
  );
};

export default FileItem;
