import React from 'react';
import './MediaViewer.css';

const MediaViewer = ({ file, fileUrl, onClose }) => {
  const isImage = () => {
    const ext = file.fileName.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
  };

  const isVideo = () => {
    const ext = file.fileName.split('.').pop().toLowerCase();
    return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('media-viewer-overlay')) {
      onClose();
    }
  };

  return (
    <div className="media-viewer-overlay" onClick={handleOverlayClick}>
      <div className="media-viewer-container">
        {/* Header */}
        <div className="media-viewer-header">
          <div className="media-viewer-info">
            <h3 className="media-viewer-title">{file.fileName}</h3>
            <div className="media-viewer-meta">
              <span>{formatFileSize(file.fileSize)}</span>
              <span>•</span>
              <span>{formatDate(file.uploadTime)}</span>
            </div>
          </div>
          <div className="media-viewer-actions">
            <button 
              className="btn-viewer-action btn-download" 
              onClick={handleDownload}
              title="Download"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Download</span>
            </button>
            <button 
              className="btn-viewer-action btn-close-viewer" 
              onClick={onClose}
              title="Close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Media Content */}
        <div className="media-viewer-content">
          {isImage() && (
            <div className="media-viewer-image-container">
              <img 
                src={fileUrl} 
                alt={file.fileName}
                className="media-viewer-image"
              />
            </div>
          )}

          {isVideo() && (
            <div className="media-viewer-video-container">
              <video 
                src={fileUrl}
                controls
                controlsList="nodownload"
                className="media-viewer-video"
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {!isImage() && !isVideo() && (
            <div className="media-viewer-unsupported">
              <div className="unsupported-icon">📄</div>
              <h3>Preview not available</h3>
              <p>This file type cannot be previewed in the browser.</p>
              <button className="btn-download-alt" onClick={handleDownload}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download File
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {(isImage() || isVideo()) && (
          <div className="media-viewer-footer">
            <div className="media-viewer-tips">
              <span className="tip-icon">💡</span>
              <span className="tip-text">
                {isImage() ? 'Click and drag to pan • Scroll to zoom' : 'Use player controls to adjust playback'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaViewer;
