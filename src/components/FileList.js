import React from 'react';
import FileItem from './FileItem';
import './FileList.css';

const FileList = ({ files, onDelete }) => {
  return (
    <div className="file-list">
      <div className="file-list-header">
        <div className="col-name">File Name</div>
        <div className="col-date">Upload Date</div>
        <div className="col-size">Size</div>
        <div className="col-actions">Actions</div>
      </div>
      
      <div className="file-list-body">
        {files.map((file) => (
          <FileItem 
            key={file.id} 
            file={file} 
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default FileList;
