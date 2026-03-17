import AWS from "../aws-config";

const s3 = new AWS.S3();

// 📤 UPLOAD FILE TO S3
export const uploadToS3 = async (file, userId, onProgress) => {
  const fileKey = `uploads/${userId}/${Date.now()}-${file.name}`;

  const params = {
    Bucket: "encrypted-storage-app",
    Key: fileKey,
    Body: file,
    ContentType: file.type
  };

  try {
    const response = await s3.upload(params)
      .on('httpUploadProgress', (evt) => {
        if (onProgress) {
          const progress = Math.round((evt.loaded / evt.total) * 100);
          onProgress(progress);
        }
      })
      .promise();
    
    return { fileKey, url: response.Location };
  } catch (err) {
    console.error("❌ S3 Upload Error:", err);
    throw new Error(`Failed to upload file: ${err.message}`);
  }
};

// 🗑️ DELETE FILE FROM S3
export const deleteFromS3 = async (fileKey) => {
  const params = {
    Bucket: "encrypted-storage-app",
    Key: fileKey
  };

  try {
    await s3.deleteObject(params).promise();
    console.log("✅ File deleted from S3:", fileKey);
  } catch (err) {
    console.error("❌ S3 Delete Error:", err);
    throw new Error(`Failed to delete file from S3: ${err.message}`);
  }
};

// 🔗 GET SIGNED URL FOR DOWNLOAD
export const getSignedUrl = async (fileKey) => {
  const params = {
    Bucket: "encrypted-storage-app",
    Key: fileKey,
    Expires: 3600 // URL expires in 1 hour
  };

  try {
    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  } catch (err) {
    console.error("❌ Error generating signed URL:", err);
    throw new Error(`Failed to generate download URL: ${err.message}`);
  }
};