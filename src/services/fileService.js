// 🔄 FILE SERVICE - S3 + DynamoDB Integration
import { uploadToS3, deleteFromS3, getSignedUrl } from './s3Service';
import { saveMetadata, getFiles, deleteMetadata, getFileMetadata } from './dbService';

/**
 * 📤 COMPLETE UPLOAD FLOW
 * Uploads file to S3 and saves metadata to DynamoDB
 */
export const handleUpload = async (file, userId, onProgress) => {
  try {
    console.log("📤 Starting upload process...");
    console.log("📁 File:", file.name, "Size:", file.size, "Type:", file.type);
    
    // Step 1: Upload to S3
    const result = await uploadToS3(file, userId, onProgress);
    console.log("✅ File uploaded to S3:", result.fileKey);

    // Step 2: Save metadata to DynamoDB
    const fileId = await saveMetadata(file, result.fileKey, result.url, userId);
    console.log("✅ Metadata saved to DynamoDB with ID:", fileId);

    // Create response data
    const fileData = {
      fileId,
      userId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      s3Key: result.fileKey,
      fileUrl: result.url,
      uploadTime: new Date().toISOString()
    };

    return {
      success: true,
      fileId,
      message: "Upload successful!",
      data: fileData
    };
  } catch (err) {
    console.error("❌ Upload failed:", err);
    throw new Error(`Upload failed: ${err.message}`);
  }
};

/**
 * 📥 GET USER'S FILE LIST
 * Fetches all files for a user from DynamoDB
 */
export const handleGetFiles = async (userId) => {
  try {
    console.log("📂 Fetching files from DynamoDB for user:", userId);
    
    const files = await getFiles(userId);
    console.log(`✅ Retrieved ${files.length} files from DynamoDB`);
    
    return files;
  } catch (err) {
    console.error("❌ Failed to fetch files:", err);
    throw new Error(`Failed to fetch files: ${err.message}`);
  }
};

/**
 * 🗑️ COMPLETE DELETE FLOW
 * Deletes file from S3 and removes metadata from DynamoDB
 */
export const handleDelete = async (fileId) => {
  try {
    console.log("🗑️ Starting delete process for fileId:", fileId);
    
    // Step 1: Get file metadata from DynamoDB to get S3 key
    const fileMetadata = await getFileMetadata(fileId);
    
    if (!fileMetadata) {
      throw new Error("File not found in database");
    }

    console.log("📄 File metadata retrieved:", fileMetadata.fileName);

    // Step 2: Delete from S3
    await deleteFromS3(fileMetadata.s3Key);
    console.log("✅ File deleted from S3:", fileMetadata.s3Key);

    // Step 3: Delete metadata from DynamoDB
    await deleteMetadata(fileId);
    console.log("✅ Metadata deleted from DynamoDB");

    return {
      success: true,
      message: "File deleted successfully!"
    };
  } catch (err) {
    console.error("❌ Delete failed:", err);
    throw new Error(`Delete failed: ${err.message}`);
  }
};

/**
 * 👁️ GET DOWNLOAD URL
 * Generates a signed URL for downloading a file
 */
export const handleGetDownloadUrl = async (fileId) => {
  try {
    console.log("🔗 Generating download URL for fileId:", fileId);
    
    // Get file metadata from DynamoDB
    const fileMetadata = await getFileMetadata(fileId);
    
    if (!fileMetadata) {
      throw new Error("File not found in database");
    }

    console.log("📄 Generating signed URL for:", fileMetadata.fileName);

    // Generate signed URL from S3
    const url = await getSignedUrl(fileMetadata.s3Key);
    
    console.log("✅ Signed URL generated");

    return {
      url,
      fileName: fileMetadata.fileName
    };
  } catch (err) {
    console.error("❌ Failed to generate download URL:", err);
    throw new Error(`Failed to generate download URL: ${err.message}`);
  }
};
