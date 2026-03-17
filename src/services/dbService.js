import AWS from "../aws-config";
import { v4 as uuidv4 } from "uuid";

const db = new AWS.DynamoDB.DocumentClient();

// 💾 SAVE FILE METADATA TO DYNAMODB
export const saveMetadata = async (file, fileKey, url, userId) => {
  const fileId = uuidv4();
  
  const params = {
    TableName: "FileMetadata",
    Item: {
      fileId: fileId,
      userId: userId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      s3Key: fileKey,
      fileUrl: url,
      uploadTime: new Date().toISOString()
    }
  };

  try {
    await db.put(params).promise();
    console.log("✅ File metadata saved to DynamoDB");
    return fileId;
  } catch (err) {
    console.error("❌ DynamoDB Save Error:", err);
    throw new Error(`Failed to save metadata: ${err.message}`);
  }
};

// 📥 GET ALL FILES FOR A USER
export const getFiles = async (userId) => {
  const params = {
    TableName: "FileMetadata"
  };

  try {
    const data = await db.scan(params).promise();
    
    // Filter by userId and sort by upload time (newest first)
    const userFiles = data.Items
      .filter(item => item.userId === userId)
      .sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
    
    console.log(`✅ Retrieved ${userFiles.length} files from DynamoDB`);
    return userFiles;
  } catch (err) {
    console.error("❌ DynamoDB Get Error:", err);
    throw new Error(`Failed to fetch files: ${err.message}`);
  }
};

// 🗑️ DELETE FILE METADATA FROM DYNAMODB
export const deleteMetadata = async (fileId) => {
  const params = {
    TableName: "FileMetadata",
    Key: { fileId }
  };

  try {
    await db.delete(params).promise();
    console.log("✅ File metadata deleted from DynamoDB");
  } catch (err) {
    console.error("❌ DynamoDB Delete Error:", err);
    throw new Error(`Failed to delete metadata: ${err.message}`);
  }
};

// 🔍 GET SINGLE FILE METADATA
export const getFileMetadata = async (fileId) => {
  const params = {
    TableName: "FileMetadata",
    Key: { fileId }
  };

  try {
    const data = await db.get(params).promise();
    return data.Item;
  } catch (err) {
    console.error("❌ DynamoDB Get Error:", err);
    throw new Error(`Failed to get file metadata: ${err.message}`);
  }
};