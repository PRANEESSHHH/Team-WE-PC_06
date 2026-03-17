# 🚀 Complete DynamoDB Implementation Guide

## 📋 Table of Contents
1. [Create DynamoDB Table](#step-1-create-dynamodb-table)
2. [Set IAM Permissions](#step-2-set-iam-permissions)
3. [Verify Code Setup](#step-3-verify-code-setup)
4. [Test the Integration](#step-4-test-the-integration)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 STEP 1: Create DynamoDB Table

### Option A: Using AWS Console (Recommended - 5 minutes)

1. **Open DynamoDB Console:**
   - Go to: https://console.aws.amazon.com/dynamodb/
   - Or search "DynamoDB" in AWS services search bar

2. **Create New Table:**
   - Click **"Create table"** (orange button at top right)

3. **Table Settings:**
   ```
   Table name: FileMetadata
   
   Partition key: fileId (String)
   
   Table settings: Default settings
   
   Capacity mode: On-demand (recommended for variable workload)
   ```

4. **Additional Settings (Optional):**
   - Leave encryption at rest: Default
   - Don't add sort key
   - Don't add secondary indexes (for now)

5. **Create Table:**
   - Click **"Create table"** button at bottom
   - Wait 30-60 seconds for table to become "Active"

6. **Verify Table Created:**
   - You should see status: **Active** (green)
   - Note: Table ARN for later

---

### Option B: Using AWS CLI (Fast - 1 minute)

If you have AWS CLI installed:

```bash
aws dynamodb create-table \
  --table-name FileMetadata \
  --attribute-definitions AttributeName=fileId,AttributeType=S \
  --key-schema AttributeName=fileId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
```

**Wait for table to be active:**
```bash
aws dynamodb describe-table --table-name FileMetadata --region ap-south-1
```

Look for: `"TableStatus": "ACTIVE"`

---

## 🔐 STEP 2: Set IAM Permissions

Your IAM user needs permissions to read/write to DynamoDB.

### Option A: AWS Console (Recommended)

1. **Go to IAM Console:**
   - Search "IAM" in AWS services
   - Click **Users** in left sidebar
   - Select your user: `Pranesh-Kumar`

2. **Add DynamoDB Permissions:**
   - Click **"Add permissions"** button
   - Select **"Attach policies directly"**
   - Search for: `AmazonDynamoDBFullAccess`
   - Check the box next to it
   - Click **"Add permissions"**

3. **Verify Permissions Added:**
   - Go to **Permissions** tab
   - You should see `AmazonDynamoDBFullAccess` listed

---

### Option B: Create Custom Policy (More Secure)

If you want minimal permissions (production-ready):

1. **In IAM Console:**
   - Click **Policies** → **Create policy**
   - Click **JSON** tab

2. **Paste This Policy:**
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

3. **Name the Policy:**
   - Policy name: `CloudCrypt-DynamoDB-Access`
   - Click **Create policy**

4. **Attach to Your User:**
   - Go back to Users → Your user
   - Add permissions → Attach policy
   - Search for `CloudCrypt-DynamoDB-Access`
   - Attach it

---

## 💻 STEP 3: Verify Code Setup

### Check Your Services Are Updated ✅

Your code is already updated! Here's what's configured:

#### 1. DynamoDB Service (`src/services/dbService.js`)

```javascript
// ✅ Already configured!
const db = new AWS.DynamoDB.DocumentClient();

export const saveMetadata = async (file, fileKey, url, userId) => {
  // Saves to FileMetadata table
};

export const getFiles = async (userId) => {
  // Fetches from FileMetadata table
};

export const deleteMetadata = async (fileId) => {
  // Deletes from FileMetadata table
};
```

#### 2. File Service (`src/services/fileService.js`)

```javascript
// ✅ Already updated to use DynamoDB!
import { saveMetadata, getFiles, deleteMetadata, getFileMetadata } from './dbService';
```

#### 3. AWS Config (`src/aws-config.js`)

```javascript
// ✅ Already configured!
AWS.config.update({
  accessKeyId: "YOUR_AWS_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_AWS_SECRET_ACCESS_KEY",
  region: "your-region"
});
```

---

## 🧪 STEP 4: Test the Integration

### 1. Start Your App (Already Running)

Your app should already be running at: http://localhost:3000

If not:
```bash
npm start
```

### 2. Test Upload Flow

1. **Open App:** http://localhost:3000

2. **Login:**
   - Email: `test@cloudcrypt.com`
   - Password: `anything`

3. **Upload a File:**
   - Click **"📤 Upload File"**
   - Select any file (image, PDF, document)
   - Watch the progress bar
   - Should see: "Upload successful!" ✅

4. **Check Browser Console (F12):**
   ```
   📤 Starting upload process...
   📁 File: test.pdf Size: 123456 Type: application/pdf
   ✅ File uploaded to S3: uploads/test@cloudcrypt.com/1234567-test.pdf
   ✅ Metadata saved to DynamoDB with ID: abc123-xyz789...
   ```

### 3. Verify in AWS DynamoDB

1. **Go to DynamoDB Console:**
   - https://console.aws.amazon.com/dynamodb/

2. **View Table Items:**
   - Click **"Explore items"** in left sidebar
   - Select table: **FileMetadata**
   - Click **"Scan"** or **"Run"**

3. **You Should See:**
   ```
   fileId: "abc123-xyz789..."
   userId: "test@cloudcrypt.com"
   fileName: "test.pdf"
   fileSize: 123456
   fileType: "application/pdf"
   s3Key: "uploads/test@cloudcrypt.com/1234567-test.pdf"
   fileUrl: "https://encrypted-storage-app.s3.ap-south-1..."
   uploadTime: "2026-03-17T14:30:00.000Z"
   ```

### 4. Verify in AWS S3

1. **Go to S3 Console**
2. **Open bucket:** `encrypted-storage-app`
3. **Navigate to:** `uploads/test@cloudcrypt.com/`
4. **You should see:** Your uploaded file!

### 5. Test File List (Fetch from DynamoDB)

1. **In your app dashboard:**
   - You should see the uploaded file in the list
   - File details should match what's in DynamoDB

2. **Browser Console:**
   ```
   📂 Fetching files from DynamoDB for user: test@cloudcrypt.com
   ✅ Retrieved 1 files from DynamoDB
   ```

### 6. Test Download

1. **Click "👁️ View" on a file**

2. **Browser Console:**
   ```
   🔗 Generating download URL for fileId: abc123...
   📄 Generating signed URL for: test.pdf
   ✅ Signed URL generated
   ```

3. **File should open/download** ✅

### 7. Test Delete

1. **Click "🗑️ Delete" on a file**
2. **Confirm deletion**

3. **Browser Console:**
   ```
   🗑️ Starting delete process for fileId: abc123...
   📄 File metadata retrieved: test.pdf
   ✅ File deleted from S3: uploads/test@cloudcrypt.com/1234567-test.pdf
   ✅ Metadata deleted from DynamoDB
   ```

4. **Verify in AWS:**
   - **DynamoDB:** Item should be gone
   - **S3:** File should be deleted

---

## 🎯 Data Flow Diagram

```
┌─────────────────────────────────────────┐
│         UPLOAD FLOW                     │
└─────────────────────────────────────────┘

User selects file
    ↓
React Component (UploadModal)
    ↓
fileService.handleUpload()
    ↓
    ├─→ s3Service.uploadToS3()
    │   └─→ AWS S3 Bucket
    │       └─→ uploads/user@email/file.pdf ✅
    │
    └─→ dbService.saveMetadata()
        └─→ AWS DynamoDB Table
            └─→ FileMetadata item created ✅


┌─────────────────────────────────────────┐
│         FETCH FILES FLOW                │
└─────────────────────────────────────────┘

Dashboard loads
    ↓
fileService.handleGetFiles()
    ↓
dbService.getFiles()
    ↓
AWS DynamoDB scan/query
    ↓
Return files array
    ↓
Display in UI ✅


┌─────────────────────────────────────────┐
│         DELETE FLOW                     │
└─────────────────────────────────────────┘

User clicks delete
    ↓
fileService.handleDelete()
    ↓
    ├─→ dbService.getFileMetadata()
    │   └─→ Get s3Key from DynamoDB
    │
    ├─→ s3Service.deleteFromS3()
    │   └─→ Delete from S3 Bucket ✅
    │
    └─→ dbService.deleteMetadata()
        └─→ Delete from DynamoDB ✅
```

---

## 📊 DynamoDB Table Structure

### Table: FileMetadata

**Primary Key:**
- `fileId` (String) - Partition Key

**Attributes:**
```javascript
{
  "fileId": "uuid-v4-string",                        // Primary key
  "userId": "user@example.com",                      // User identifier
  "fileName": "document.pdf",                        // Original filename
  "fileSize": 1024000,                               // Size in bytes
  "fileType": "application/pdf",                     // MIME type
  "s3Key": "uploads/user@email/timestamp-file.pdf",  // S3 object key
  "fileUrl": "https://bucket.s3.region...",          // S3 URL
  "uploadTime": "2026-03-17T14:30:00.000Z"          // ISO timestamp
}
```

**Indexes:**
- None required for basic functionality
- (Optional) Can add GSI on `userId` for faster user-specific queries

---

## 🐛 Troubleshooting

### Issue 1: "ResourceNotFoundException: Requested resource not found"

**Error in console:**
```
ResourceNotFoundException: Requested resource not found: Table: FileMetadata
```

**Fix:**
1. Table doesn't exist or wrong name
2. Check table name in DynamoDB console
3. Verify `dbService.js` line 8: `TableName: "FileMetadata"`
4. Check region matches: `ap-south-1`

---

### Issue 2: "AccessDeniedException: User is not authorized"

**Error in console:**
```
AccessDeniedException: User: arn:aws:iam::xxx:user/Pranesh-Kumar is not authorized to perform: dynamodb:PutItem
```

**Fix:**
1. IAM user doesn't have DynamoDB permissions
2. Follow Step 2 above to add permissions
3. Attach `AmazonDynamoDBFullAccess` policy

---

### Issue 3: Upload succeeds but items don't appear in DynamoDB

**Possible causes:**

1. **Check browser console for errors**
2. **Verify credentials:**
   - Correct access key
   - Correct secret key
   - Correct region

3. **Check table name:**
   ```javascript
   // In dbService.js
   TableName: "FileMetadata"  // Must match exactly
   ```

4. **Check IAM permissions include:**
   - `dynamodb:PutItem`
   - `dynamodb:GetItem`
   - `dynamodb:Scan`

---

### Issue 4: Files don't show in dashboard after upload

**Check:**

1. **Browser console logs:**
   ```
   📂 Fetching files from DynamoDB...
   ✅ Retrieved X files
   ```

2. **DynamoDB Console:**
   - Go to table
   - Click "Explore items"
   - Verify items exist

3. **userId Match:**
   - Upload userId must match fetch userId
   - Check browser console for userId used

---

### Issue 5: Delete fails

**Error:** "File not found in database"

**Fix:**
1. Item might be deleted from DynamoDB but not S3
2. Manually check and delete from S3 if needed
3. Ensure fileId being passed is correct

---

## ✅ Success Checklist

- [ ] DynamoDB table `FileMetadata` created and **Active**
- [ ] IAM permissions added (`AmazonDynamoDBFullAccess`)
- [ ] App running at http://localhost:3000
- [ ] Uploaded a test file successfully
- [ ] File appears in DynamoDB table (verify in console)
- [ ] File appears in S3 bucket
- [ ] File shows in dashboard list
- [ ] Download/view works
- [ ] Delete removes from both S3 and DynamoDB

---

## 💰 DynamoDB Costs

### Free Tier (First 12 months):
- ✅ 25 GB storage
- ✅ 25 WCU (Write Capacity Units)
- ✅ 25 RCU (Read Capacity Units)

### On-Demand Pricing (After Free Tier):
- **Write:** ~$1.25 per million write requests
- **Read:** ~$0.25 per million read requests

### Example Usage:
- 1,000 file uploads/month: ~$0.00125
- 10,000 file list views/month: ~$0.0025
- **Total: ~$0.004/month** (practically free!)

---

## 🎉 You're Done!

Your CloudCrypt app now uses:
- ✅ **S3** for file storage
- ✅ **DynamoDB** for metadata storage
- ✅ Complete CRUD operations
- ✅ Production-ready architecture
- ✅ Multi-device sync capability

**Test it now and enjoy your fully functional cloud storage app!** 🚀

---

## 📚 Quick Reference

**DynamoDB Console:** https://console.aws.amazon.com/dynamodb/  
**IAM Console:** https://console.aws.amazon.com/iam/  
**S3 Console:** https://console.aws.amazon.com/s3/  

**Table Name:** `FileMetadata`  
**Primary Key:** `fileId` (String)  
**Region:** `ap-south-1`  

**Your App:** http://localhost:3000  
**Browser Console:** Press F12
