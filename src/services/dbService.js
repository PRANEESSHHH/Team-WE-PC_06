import AWS from "../aws-config";
import { v4 as uuidv4 } from "uuid";

const db = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'FileMetadata';

/**
 * Save file metadata to DynamoDB
 */
export const saveMetadata = async (file, fileKey, url, userId) => {
  const fileId = uuidv4();
  const timestamp = new Date().toISOString();

  const item = {
    fileId: fileId,
    userId: userId,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    fileKey: fileKey,
    s3Key: fileKey,
    uploadTime: timestamp,
    lastModified: timestamp,
    status: 'active'
  };

  const params = {
    TableName: TABLE_NAME,
    Item: item
  };

  try {
    await db.put(params).promise();
    return fileId;
  } catch (error) {
    console.error('Error saving metadata to DynamoDB:', error);
    throw error;
  }
};

/**
 * Get all files for a user from DynamoDB
 */
export const getFiles = async (userId) => {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: 'userId = :userId AND #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':userId': userId,
      ':status': 'active'
    }
  };

  try {
    const result = await db.scan(params).promise();
    
    // Sort by upload time (newest first)
    const sortedFiles = result.Items.sort((a, b) => 
      new Date(b.uploadTime) - new Date(a.uploadTime)
    );
    
    return sortedFiles;
  } catch (error) {
    console.error('Error fetching files from DynamoDB:', error);
    throw error;
  }
};

/**
 * Delete file metadata from DynamoDB
 */
export const deleteMetadata = async (fileId) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      fileId: fileId
    },
    UpdateExpression: 'SET #status = :status, lastModified = :timestamp',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': 'deleted',
      ':timestamp': new Date().toISOString()
    }
  };

  try {
    await db.update(params).promise();
    return { success: true };
  } catch (error) {
    console.error('Error deleting metadata from DynamoDB:', error);
    throw error;
  }
};

/**
 * Get specific file metadata from DynamoDB
 */
export const getFileMetadata = async (fileId) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      fileId: fileId
    }
  };

  try {
    const result = await db.get(params).promise();
    return result.Item || null;
  } catch (error) {
    console.error('Error fetching file metadata from DynamoDB:', error);
    throw error;
  }
};
