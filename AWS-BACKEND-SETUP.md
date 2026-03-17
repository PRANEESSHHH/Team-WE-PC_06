# 🔥 CloudCrypt - Complete AWS S3 + DynamoDB Setup Guide

## ✅ What's Already Done

Your React app is **fully configured** with direct AWS integration! Here's what you have:

### 📦 Installed Packages
- ✅ `aws-sdk` - AWS SDK for JavaScript
- ✅ `uuid` - Generate unique file IDs
- ✅ All React dependencies

### 🔧 Services Created
- ✅ `s3Service.js` - Upload, delete, signed URLs
- ✅ `dbService.js` - Save, fetch, delete metadata
- ✅ `fileService.js` - **Combined workflow functions**
- ✅ `authService.js` - User authentication

### 🎯 Complete Workflow Implemented

```
📤 UPLOAD: React → S3 (file) → DynamoDB (metadata) → Success
📥 VIEW: React → DynamoDB (list) → Display
👁️ DOWNLOAD: React → Get signed URL → Open file
🗑️ DELETE: React → S3 (delete file) → DynamoDB (delete metadata) → Success
```

---

## 🚀 AWS Setup Steps

### STEP 1: Configure AWS Credentials ⚠️

**IMPORTANT:** Your credentials are currently in the code. For security:

1. **Option A: Use Environment Variables (Recommended)**

Create `.env` file in project root:
```env
REACT_APP_AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_HERE
REACT_APP_AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY_HERE
REACT_APP_AWS_REGION=your-region
REACT_APP_S3_BUCKET=encrypted-storage-app
REACT_APP_DYNAMODB_TABLE=FileMetadata
```

Then update `src/aws-config.js`:
```javascript
import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION
});

export default AWS;
```

2. **Add `.env` to `.gitignore`:**
```bash
echo ".env" >> .gitignore
```

3. **Never commit credentials to GitHub!**

---

### STEP 2: Create S3 Bucket

#### Using AWS Console:

1. Go to **AWS S3 Console**: https://s3.console.aws.amazon.com/
2. Click **"Create bucket"**
3. **Bucket name**: `encrypted-storage-app` (or change in your code)
4. **Region**: `ap-south-1` (Mumbai)
5. **Block Public Access**: ✅ Keep all checked (private bucket)
6. Click **"Create bucket"**

#### Using AWS CLI:
```bash
aws s3 mb s3://encrypted-storage-app --region ap-south-1
```

---

### STEP 3: Configure S3 CORS ⚠️ IMPORTANT!

Without CORS, your React app **cannot upload** to S3!

#### In AWS Console:

1. Go to S3 → Select your bucket `encrypted-storage-app`
2. Go to **Permissions** tab
3. Scroll to **Cross-origin resource sharing (CORS)**
4. Click **Edit**
5. Paste this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

6. Click **Save**

#### Using AWS CLI:

Create `cors.json`:
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["PUT", "POST", "GET", "DELETE"],
      "AllowedOrigins": ["http://localhost:3000"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
```

Apply CORS:
```bash
aws s3api put-bucket-cors --bucket encrypted-storage-app --cors-configuration file://cors.json
```

---

### STEP 4: Create DynamoDB Table

#### Using AWS Console:

1. Go to **DynamoDB Console**: https://console.aws.amazon.com/dynamodb/
2. Click **"Create table"**
3. **Table name**: `FileMetadata`
4. **Partition key**: `fileId` (String)
5. **Table settings**: 
   - Choose **On-demand** (pay per request)
   - Or **Provisioned** (set capacity units)
6. Click **"Create table"**

#### Using AWS CLI:

```bash
aws dynamodb create-table \
  --table-name FileMetadata \
  --attribute-definitions AttributeName=fileId,AttributeType=S \
  --key-schema AttributeName=fileId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
```

---

### STEP 5: Set IAM Permissions ⚠️ CRITICAL!

Your IAM user **MUST** have these permissions:

#### S3 Permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::encrypted-storage-app",
        "arn:aws:s3:::encrypted-storage-app/*"
      ]
    }
  ]
}
```

#### DynamoDB Permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:DeleteItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": "arn:aws:dynamodb:ap-south-1:*:table/FileMetadata"
    }
  ]
}
```

#### How to Apply:

1. Go to **IAM Console**: https://console.aws.amazon.com/iam/
2. Click **Users** → Select your user
3. Click **Add permissions** → **Attach policies directly**
4. Click **Create policy** → **JSON** → Paste above policies
5. Name them: `S3-FileUpload` and `DynamoDB-FileMetadata`
6. Attach to your user

---

### STEP 6: Verify DynamoDB Table Structure

Your table should have these attributes:

| Attribute | Type | Description |
|-----------|------|-------------|
| `fileId` (PK) | String | Unique file identifier (UUID) |
| `userId` | String | User email |
| `fileName` | String | Original file name |
| `fileSize` | Number | File size in bytes |
| `fileType` | String | MIME type |
| `s3Key` | String | S3 object key |
| `fileUrl` | String | S3 URL |
| `uploadTime` | String | ISO timestamp |

---

## 🧪 Testing Your Setup

### 1. Test Upload Flow

```bash
# Start your app
npm start

# Open http://localhost:3000
# Login with any email
# Upload a file
```

**Check in AWS Console:**
- ✅ S3: File appears in bucket
- ✅ DynamoDB: Metadata saved in table

### 2. Test View/Download

```bash
# Click "View" on a file
# Should open/download the file
```

**Check browser console:**
- ✅ "🔗 Generating download URL..."
- ✅ No CORS errors

### 3. Test Delete

```bash
# Click "Delete" on a file
# Confirm deletion
```

**Check in AWS Console:**
- ✅ S3: File removed from bucket
- ✅ DynamoDB: Metadata removed from table

---

## 📊 Your Current Code Structure

### Upload Flow (Already Implemented!)

```javascript
// Component: UploadModal.js
import { handleUpload } from '../services/fileService';

const result = await handleUpload(selectedFile, userEmail, (progress) => {
  setUploadProgress(progress);
});

// Behind the scenes:
// 1. uploadToS3() - Upload file to S3
// 2. saveMetadata() - Save to DynamoDB
// 3. Return success
```

### Fetch Files (Already Implemented!)

```javascript
// Component: Dashboard.js
import { handleGetFiles } from '../services/fileService';

const files = await handleGetFiles(userEmail);
setFiles(files);

// Behind the scenes:
// 1. getFiles() - Query DynamoDB by userId
// 2. Return filtered & sorted file list
```

### Delete Flow (Already Implemented!)

```javascript
// Component: Dashboard.js
import { handleDelete } from '../services/fileService';

await handleDelete(fileId);

// Behind the scenes:
// 1. getFileMetadata() - Get s3Key from DynamoDB
// 2. deleteFromS3() - Delete file from S3
// 3. deleteMetadata() - Delete from DynamoDB
```

---

## 🔒 Security Best Practices

### ✅ What You Should Do:

1. **Move credentials to environment variables** (`.env` file)
2. **Add `.env` to `.gitignore`**
3. **Use IAM roles** instead of access keys (for production)
4. **Enable S3 bucket versioning** (for file recovery)
5. **Enable CloudWatch logging**
6. **Set up S3 lifecycle policies** (archive old files)
7. **Add file type validation** (prevent malicious files)
8. **Set max file size limits**

### ⚠️ Security Warnings:

- 🚨 **Never commit AWS credentials to GitHub!**
- 🚨 **Don't use root account credentials**
- 🚨 **Rotate access keys regularly**
- 🚨 **Use least privilege IAM policies**

---

## 🐛 Common Issues & Fixes

### Issue 1: CORS Error when uploading

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Fix:** Configure S3 CORS (see STEP 3)

---

### Issue 2: AccessDenied error

```
Access Denied when uploading to S3
```

**Fix:** Check IAM permissions (see STEP 5)

---

### Issue 3: ResourceNotFoundException

```
Requested resource not found: Table: FileMetadata
```

**Fix:** Create DynamoDB table (see STEP 4)

---

### Issue 4: Credentials not found

```
Missing credentials in config
```

**Fix:** Check `aws-config.js` has correct credentials

---

### Issue 5: Invalid bucket name

```
The specified bucket does not exist
```

**Fix:** 
- Create bucket with exact name: `encrypted-storage-app`
- Or update bucket name in `s3Service.js` line 9

---

## 💰 Cost Estimation

### AWS Free Tier (First 12 months):

**S3:**
- ✅ 5 GB storage
- ✅ 20,000 GET requests
- ✅ 2,000 PUT requests

**DynamoDB:**
- ✅ 25 GB storage
- ✅ 25 WCU (Write Capacity Units)
- ✅ 25 RCU (Read Capacity Units)

### After Free Tier:

**Example:** 1000 files (10GB total), 10,000 operations/month

- S3: ~$0.25/month
- DynamoDB: ~$0.50/month
- **Total: ~$0.75/month**

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Check AWS CLI configuration
aws configure list

# List S3 buckets
aws s3 ls

# List DynamoDB tables
aws dynamodb list-tables --region ap-south-1

# View files in S3
aws s3 ls s3://encrypted-storage-app/uploads/

# Scan DynamoDB table
aws dynamodb scan --table-name FileMetadata --region ap-south-1
```

---

## ✅ Final Checklist

Before testing:

- [ ] S3 bucket `encrypted-storage-app` created
- [ ] S3 CORS configured
- [ ] DynamoDB table `FileMetadata` created
- [ ] IAM permissions set (S3 + DynamoDB)
- [ ] Credentials in `.env` file
- [ ] `.env` added to `.gitignore`
- [ ] App running: `npm start`

Test all features:
- [ ] Upload a file → Check S3
- [ ] View file list → Check DynamoDB
- [ ] Download/view file
- [ ] Delete file → Check both S3 and DynamoDB

---

## 🎯 Your Files

| File | Purpose |
|------|---------|
| `src/aws-config.js` | AWS credentials & config |
| `src/services/s3Service.js` | S3 upload/delete/URLs |
| `src/services/dbService.js` | DynamoDB CRUD operations |
| `src/services/fileService.js` | **Combined workflows** |
| `src/components/UploadModal.js` | Upload UI + logic |
| `src/pages/Dashboard.js` | File list + delete logic |
| `src/components/FileItem.js` | Individual file display |

---

**Your app is ready to connect to AWS! Just complete the setup steps above and test! 🚀**
