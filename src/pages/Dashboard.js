import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import UploadModal from '../components/UploadModal';
import FileList from '../components/FileList';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [files, setFiles] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { handleGetFiles } = await import('../services/fileService');
      const { getCurrentUser } = await import('../services/authService');
      
      const currentUser = getCurrentUser();
      if (!currentUser) {
        console.warn('⚠️ No user logged in');
        setLoading(false);
        return;
      }

      const filesFromDB = await handleGetFiles(currentUser.email);
      setFiles(filesFromDB);
      
      console.log(`✅ Loaded ${filesFromDB.length} files`);
    } catch (error) {
      console.error('❌ Error fetching files:', error);
      alert(`Failed to load files: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async (newFile) => {
    // Refresh the entire file list from DynamoDB
    // This ensures consistency with what's actually stored
    await fetchFiles();
    setIsUploadModalOpen(false);
    console.log('✅ File list refreshed from DynamoDB');
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const { handleDelete } = await import('../services/fileService');
      await handleDelete(fileId);
      
      // Remove from local state
      setFiles(prevFiles => prevFiles.filter(f => f.fileId !== fileId));
      
      console.log('✅ File deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      alert(`Failed to delete file: ${error.message}`);
    }
  };

  return (
    <div className="dashboard">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome, {user.split('@')[0]} 👋</h1>
            <p className="subtitle">Manage your encrypted files securely</p>
          </div>
          <button 
            className="btn-upload"
            onClick={() => setIsUploadModalOpen(true)}
          >
            📤 Upload File
          </button>
        </div>

        <div className="dashboard-content">
          <div className="files-section">
            <div className="section-header">
              <h2>Your Files</h2>
              <span className="file-count">{files.length} file{files.length !== 1 ? 's' : ''}</span>
            </div>
            
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <h3>No files yet</h3>
                <p>Upload your first file to get started</p>
                <button 
                  className="btn-primary"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  Upload File
                </button>
              </div>
            ) : (
              <FileList files={files} onDelete={handleDelete} />
            )}
          </div>
        </div>
      </div>

      {isUploadModalOpen && (
        <UploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </div>
  );
};

export default Dashboard;
