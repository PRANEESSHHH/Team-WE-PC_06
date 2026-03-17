import React from 'react';
import './FileItem.css';

const FileItem = ({ file, onDelete }) => {
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

  const handleView = async () => {
    try {
      console.log('👁️ Viewing file:', file.fileName);
      
      // Import download service
      const { handleGetDownloadUrl } = await import('../services/fileService');
      
      // Get signed download URL
      const { url } = await handleGetDownloadUrl(file.fileId);
      
      // Open in new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error('❌ Error viewing file:', error);
      alert(`Failed to view file: ${error.message}`);
    }
  };

  const handleDelete = () => {
    onDelete(file.fileId);
  };

  return (
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
            title="View/Download"
          >
            👁️ View
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
  );
};

export default FileItem;
