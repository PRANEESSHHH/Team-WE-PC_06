# 🐛 CloudCrypt - Troubleshooting Guide

## If Upload Fails, Check These:

### 1. Browser Console Errors

**Open Browser Console (F12):**
- Look for red error messages
- Common errors and fixes:

#### Error: "Access Denied"
```
Access to XMLHttpRequest at 'https://s3...' from origin 'http://localhost:3000' has been blocked
```
**Fix:** S3 CORS not configured correctly
- Go back to S3 → Permissions → CORS
- Make sure configuration is saved

#### Error: "AccessDenied: Access Denied"
```
AccessDenied: Access Denied at Request.extractError
```
**Fix:** IAM permissions issue
- IAM user needs S3 permissions
- Attach `AmazonS3FullAccess` policy

#### Error: "Requested resource not found"
```
ResourceNotFoundException: Requested resource not found: Table: FileMetadata
```
**Fix:** DynamoDB table not created
- Create table in DynamoDB console

### 2. Check AWS Credentials

**File:** `src/aws-config.js`

Make sure credentials are correct:
```javascript
AWS.config.update({
  accessKeyId: "YOUR_AWS_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_AWS_SECRET_ACCESS_KEY",
  region: "your-region"
});
```

If changed, restart app: `npm start`

### 3. Check S3 Bucket Name

**File:** `src/services/s3Service.js`

Line 9 should be:
```javascript
Bucket: "encrypted-storage-app",
```

### 4. Check DynamoDB Table Name

**File:** `src/services/dbService.js`

Line 8 should be:
```javascript
TableName: "FileMetadata",
```

### 5. Network Check

- Open browser DevTools → Network tab
- Try upload
- Look for:
  - PUT request to S3 (should be 200 OK)
  - POST to DynamoDB (should be 200)

## ✅ Success Indicators

### In Browser Console:
```
📤 Starting upload process...
✅ File uploaded to S3
✅ Metadata saved to DynamoDB
```

### In S3 Console:
- Bucket: encrypted-storage-app
- Path: uploads/your@email.com/timestamp-filename.ext

### In DynamoDB Console:
- Table: FileMetadata
- Item with fileId, userId, fileName, etc.

## 🆘 Still Not Working?

Check browser console and share the error message!
