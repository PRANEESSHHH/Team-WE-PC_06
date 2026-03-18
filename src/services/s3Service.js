import AWS from "../aws-config";

const s3 = new AWS.S3();

/**
 * Upload file to S3
 */
export const uploadToS3 = async (file, userId, onProgress) => {
  const fileKey = `${userId}/${Date.now()}-${file.name}`;
  
  const params = {
    Bucket: 'encrypted-storage-app',
    Key: fileKey,
    Body: file,
    ContentType: file.type,
    Metadata: {
      'uploaded-by': userId,
      'original-name': file.name
    }
  };

  try {
    const upload = s3.upload(params);
    
    // Track progress
    upload.on('httpUploadProgress', (progress) => {
      if (onProgress) {
        onProgress({
          loaded: progress.loaded,
          total: progress.total,
          percentage: (progress.loaded / progress.total) * 100
        });
      }
    });

    const result = await upload.promise();
    
    return {
      fileKey: result.Key,
      url: result.Location,
      etag: result.ETag
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

/**
 * Delete file from S3
 */
export const deleteFromS3 = async (fileKey) => {
  const params = {
    Bucket: 'encrypted-storage-app',
    Key: fileKey
  };

  try {
    await s3.deleteObject(params).promise();
    return { success: true };
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};

/**
 * Get signed URL for file download
 */
export const getSignedUrl = async (fileKey) => {
  const params = {
    Bucket: 'encrypted-storage-app',
    Key: fileKey,
    Expires: 3600 // URL valid for 1 hour
  };

  try {
    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};
