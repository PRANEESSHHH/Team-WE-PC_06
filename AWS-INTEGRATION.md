# AWS Integration Guide for CloudCrypt

This guide will help you integrate CloudCrypt with real AWS services.

## 📋 Prerequisites

- AWS Account
- AWS CLI installed
- Node.js & npm
- Basic AWS knowledge

## 🚀 Step-by-Step Integration

### Step 1: Install AWS Dependencies

```bash
cd "d:\Cloudverse Hackathon\CloudCrypt\cloud-crypt"

npm install aws-sdk @aws-amplify/core @aws-amplify/auth @aws-amplify/storage
```

### Step 2: Configure AWS Amplify

#### Option A: Using Amplify CLI (Recommended)

```bash
# Install Amplify CLI globally
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Project name: cloudcrypt
# Environment: dev
# Default editor: Visual Studio Code
# App type: javascript
# Framework: react
# Source directory: src
# Distribution directory: build
# Build command: npm run build
# Start command: npm start

# Add authentication
amplify add auth
# Using default configuration
# How do you want users to sign in? Email
# Do you want to configure advanced settings? No

# Add storage (S3)
amplify add storage
# Select: Content (Images, audio, video, etc.)
# Provide a friendly name: cloudcryptfiles
# Provide bucket name: cloudcrypt-files
# Who should have access? Auth users only
# What kind of access? create/update, read, delete

# Push changes to AWS
amplify push
```

#### Option B: Manual Configuration

Create `src/aws-config.js`:

```javascript
export const awsConfig = {
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_XXXXXXXXX',
    userPoolWebClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
    identityPoolId: 'us-east-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
  },
  Storage: {
    AWSS3: {
      bucket: 'cloudcrypt-files',
      region: 'us-east-1',
    }
  },
  API: {
    endpoints: [
      {
        name: "cloudcryptapi",
        endpoint: "https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/prod"
      }
    ]
  }
};
```

### Step 3: Create DynamoDB Table

#### Using AWS Console:

1. Go to DynamoDB Console
2. Create Table
   - Table name: `cloudcrypt-files`
   - Partition key: `userId` (String)
   - Sort key: `fileId` (String)
3. Create Table

#### Using AWS CLI:

```bash
aws dynamodb create-table \
  --table-name cloudcrypt-files \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=fileId,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=fileId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Step 4: Create S3 Bucket

#### Using AWS Console:

1. Go to S3 Console
2. Create Bucket
   - Name: `cloudcrypt-files-[unique-id]`
   - Region: us-east-1
   - Enable encryption (AES-256)
   - Block all public access

#### Using AWS CLI:

```bash
aws s3api create-bucket \
  --bucket cloudcrypt-files-unique-id \
  --region us-east-1

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket cloudcrypt-files-unique-id \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### Step 5: Configure IAM Policies

Create IAM policy for authenticated users:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::cloudcrypt-files-unique-id/private/${cognito-identity.amazonaws.com:sub}/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:DeleteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/cloudcrypt-files"
      ],
      "Condition": {
        "ForAllValues:StringEquals": {
          "dynamodb:LeadingKeys": [
            "${cognito-identity.amazonaws.com:sub}"
          ]
        }
      }
    }
  ]
}
```

### Step 6: Update Auth Service

Update `src/services/authService.js`:

```javascript
import { Amplify } from '@aws-amplify/core';
import { Auth } from '@aws-amplify/auth';
import awsconfig from '../aws-exports';

Amplify.configure(awsconfig);

export const login = async (email, password) => {
  try {
    const user = await Auth.signIn(email, password);
    return {
      email: user.attributes.email,
      userId: user.username,
      token: user.signInUserSession.idToken.jwtToken
    };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Login failed');
  }
};

export const signup = async (email, password) => {
  try {
    const { user } = await Auth.signUp({
      username: email,
      password: password,
      attributes: {
        email: email
      }
    });
    
    return {
      email: email,
      userId: user.username,
      needsVerification: true
    };
  } catch (error) {
    console.error('Signup error:', error);
    throw new Error(error.message || 'Signup failed');
  }
};

export const logout = async () => {
  try {
    await Auth.signOut();
    localStorage.removeItem('cloudcrypt_user');
    localStorage.removeItem('cloudcrypt_token');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    return {
      email: user.attributes.email,
      userId: user.username
    };
  } catch (error) {
    return null;
  }
};

export const isAuthenticated = async () => {
  try {
    await Auth.currentAuthenticatedUser();
    return true;
  } catch {
    return false;
  }
};
```

### Step 7: Update S3 Service

Update `src/services/s3Service.js`:

```javascript
import { Storage } from '@aws-amplify/storage';

export const uploadToS3 = async (file) => {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    
    const result = await Storage.put(fileName, file, {
      level: 'private',
      contentType: file.type,
      progressCallback(progress) {
        const percentage = (progress.loaded / progress.total) * 100;
        console.log(`Upload progress: ${percentage}%`);
      }
    });

    const url = await Storage.get(result.key, { level: 'private' });
    
    return {
      key: result.key,
      url: url
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

export const deleteFromS3 = async (fileKey) => {
  try {
    await Storage.remove(fileKey, { level: 'private' });
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
};

export const getSignedUrl = async (fileKey) => {
  try {
    const url = await Storage.get(fileKey, {
      level: 'private',
      expires: 3600 // 1 hour
    });
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate download URL');
  }
};
```

### Step 8: Update DynamoDB Service

Update `src/services/dbService.js`:

```javascript
import AWS from 'aws-sdk';
import { Auth } from '@aws-amplify/auth';

const TABLE_NAME = 'cloudcrypt-files';

const getDynamoDBClient = async () => {
  const credentials = await Auth.currentCredentials();
  
  AWS.config.update({
    region: 'us-east-1',
    credentials: Auth.essentialCredentials(credentials)
  });

  return new AWS.DynamoDB.DocumentClient();
};

export const saveFileToDynamoDB = async (fileMetadata) => {
  try {
    const dynamodb = await getDynamoDBClient();
    const user = await Auth.currentAuthenticatedUser();
    
    const params = {
      TableName: TABLE_NAME,
      Item: {
        userId: user.username,
        fileId: fileMetadata.id,
        fileName: fileMetadata.name,
        fileSize: fileMetadata.size,
        uploadDate: fileMetadata.uploadDate,
        s3Key: fileMetadata.s3Key,
        s3Url: fileMetadata.url
      }
    };

    await dynamodb.put(params).promise();
  } catch (error) {
    console.error('DynamoDB save error:', error);
    throw new Error('Failed to save file metadata');
  }
};

export const getFilesFromDynamoDB = async () => {
  try {
    const dynamodb = await getDynamoDBClient();
    const user = await Auth.currentAuthenticatedUser();
    
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': user.username
      }
    };

    const result = await dynamodb.query(params).promise();
    
    return result.Items.map(item => ({
      id: item.fileId,
      name: item.fileName,
      size: item.fileSize,
      uploadDate: item.uploadDate,
      url: item.s3Url,
      s3Key: item.s3Key
    }));
  } catch (error) {
    console.error('DynamoDB get error:', error);
    throw new Error('Failed to fetch files');
  }
};

export const deleteFileFromDynamoDB = async (fileId) => {
  try {
    const dynamodb = await getDynamoDBClient();
    const user = await Auth.currentAuthenticatedUser();
    
    const params = {
      TableName: TABLE_NAME,
      Key: {
        userId: user.username,
        fileId: fileId
      }
    };

    await dynamodb.delete(params).promise();
  } catch (error) {
    console.error('DynamoDB delete error:', error);
    throw new Error('Failed to delete file metadata');
  }
};
```

### Step 9: Update Dashboard to Use Real Services

Update `src/pages/Dashboard.js`:

```javascript
// Import real services
import { getFilesFromDynamoDB } from '../services/dbService';
import { uploadToS3 } from '../services/s3Service';
import { deleteFromS3 } from '../services/s3Service';

// In fetchFiles function:
const fetchFiles = async () => {
  setLoading(true);
  try {
    const filesFromDB = await getFilesFromDynamoDB();
    setFiles(filesFromDB);
  } catch (error) {
    console.error('Error fetching files:', error);
    alert('Failed to load files');
  } finally {
    setLoading(false);
  }
};

// In handleDelete function:
const handleDelete = async (fileId) => {
  if (!window.confirm('Are you sure you want to delete this file?')) {
    return;
  }

  try {
    const file = files.find(f => f.id === fileId);
    await deleteFromS3(file.s3Key);
    await deleteFileFromDynamoDB(fileId);
    
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
  } catch (error) {
    console.error('Error deleting file:', error);
    alert('Failed to delete file');
  }
};
```

### Step 10: Environment Variables

Create `.env` file:

```bash
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=us-east-1_XXXXXXXXX
REACT_APP_USER_POOL_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_IDENTITY_POOL_ID=us-east-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
REACT_APP_S3_BUCKET=cloudcrypt-files-unique-id
REACT_APP_DYNAMODB_TABLE=cloudcrypt-files
```

Add `.env` to `.gitignore`:

```bash
echo ".env" >> .gitignore
```

### Step 11: Test Integration

1. Start the app: `npm start`
2. Create a new account
3. Upload a file
4. Verify in AWS Console:
   - S3: Check if file appears in bucket
   - DynamoDB: Check if metadata is saved
5. Delete a file
6. Verify deletion in AWS Console

## 🔒 Security Checklist

- [ ] Enable S3 bucket encryption (AES-256)
- [ ] Block public S3 access
- [ ] Use private access level for user files
- [ ] Enable CloudTrail logging
- [ ] Set up IAM policies with least privilege
- [ ] Enable MFA for AWS Console
- [ ] Use HTTPS only
- [ ] Implement rate limiting
- [ ] Add file type validation
- [ ] Scan uploads for malware
- [ ] Set S3 object expiration policies
- [ ] Enable CloudWatch monitoring

## 💰 Cost Optimization

### S3 Costs
- Standard storage: $0.023/GB/month
- Use S3 Intelligent-Tiering for older files
- Set lifecycle policies

### DynamoDB Costs
- On-demand pricing: Pay per request
- Consider provisioned capacity for high traffic

### Data Transfer
- Use CloudFront CDN to reduce costs
- Enable compression

## 📊 Monitoring

### CloudWatch Alarms

```bash
# High S3 storage usage
aws cloudwatch put-metric-alarm \
  --alarm-name cloudcrypt-high-storage \
  --alarm-description "Alert when S3 storage exceeds 100GB" \
  --metric-name BucketSizeBytes \
  --namespace AWS/S3 \
  --statistic Average \
  --period 86400 \
  --threshold 107374182400 \
  --comparison-operator GreaterThanThreshold

# High DynamoDB read capacity
aws cloudwatch put-metric-alarm \
  --alarm-name cloudcrypt-high-reads \
  --alarm-description "Alert on high DynamoDB reads" \
  --metric-name ConsumedReadCapacityUnits \
  --namespace AWS/DynamoDB \
  --statistic Sum \
  --period 300 \
  --threshold 1000 \
  --comparison-operator GreaterThanThreshold
```

## 🚀 Production Deployment

### Build the app:

```bash
npm run build
```

### Deploy to AWS Amplify Hosting:

```bash
amplify add hosting
# Select: Hosting with Amplify Console
# Select: Manual deployment

amplify publish
```

### Or deploy to S3 + CloudFront:

```bash
# Create S3 bucket for website
aws s3 mb s3://cloudcrypt-web

# Enable website hosting
aws s3 website s3://cloudcrypt-web \
  --index-document index.html \
  --error-document index.html

# Upload build files
aws s3 sync build/ s3://cloudcrypt-web --delete

# Create CloudFront distribution (see AWS console)
```

## 🔧 Troubleshooting

### Issue: Credentials not found
**Solution**: Run `amplify configure` and set up AWS credentials

### Issue: Access denied to S3
**Solution**: Check IAM policies and bucket permissions

### Issue: CORS errors
**Solution**: Configure CORS on S3 bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### Issue: DynamoDB access denied
**Solution**: Verify Cognito identity pool has correct IAM role

## 📚 Additional Resources

- [AWS Amplify Docs](https://docs.amplify.aws/)
- [S3 Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)

---

**Good luck with your AWS integration!** 🚀
