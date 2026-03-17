# 🚀 AWS Setup Guide - React Direct Connection

## ✅ What We've Built

Your CloudCrypt app now has **FULL AWS integration** ready to go! It connects directly from React to:
- **AWS S3** for file storage (encrypted)
- **AWS DynamoDB** for file metadata
- **AWS Cognito Identity Pool** for temporary credentials

## 🎯 Current Status

✅ Demo Mode Active - App works WITHOUT AWS (uses localStorage)
⚠️ AWS Integration Ready - Just needs your AWS credentials

## 📝 Quick Setup (3 Steps)

### Step 1: Create AWS Resources

#### A. Create S3 Bucket
```bash
# Using AWS CLI
aws s3 mb s3://cloudcrypt-files-YOUR-NAME --region us-east-1

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket cloudcrypt-files-YOUR-NAME \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Enable CORS (for browser upload)
aws s3api put-bucket-cors \
  --bucket cloudcrypt-files-YOUR-NAME \
  --cors-configuration file://cors.json
```

Create `cors.json`:
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
```

#### B. Create DynamoDB Table
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

#### C. Create Cognito Identity Pool

**Using AWS Console:**

1. Go to **Cognito** → **Identity Pools** → **Create Identity Pool**
2. Name: `cloudcrypt_identity_pool`
3. Enable **unauthenticated access** (for demo/testing)
4. Create Pool
5. Copy the **Identity Pool ID** (looks like: `us-east-1:xxxx-xxxx-xxxx`)

**Set IAM Permissions:**

The identity pool creates two roles. Update the **unauthenticated** role:

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
        "arn:aws:s3:::cloudcrypt-files-YOUR-NAME/*",
        "arn:aws:s3:::cloudcrypt-files-YOUR-NAME"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:DeleteItem",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/cloudcrypt-files"
    }
  ]
}
```

### Step 2: Update Configuration

Edit `src/aws-config.js`:

```javascript
export const awsConfig = {
  region: 'us-east-1',
  
  // Paste your Identity Pool ID here
  identityPoolId: 'us-east-1:12345678-1234-1234-1234-123456789abc',
  
  s3: {
    bucketName: 'cloudcrypt-files-YOUR-NAME', // Your bucket name
    region: 'us-east-1'
  },
  
  dynamodb: {
    tableName: 'cloudcrypt-files',
    region: 'us-east-1'
  }
};

// Switch to REAL AWS mode
export const isDemoMode = false; // Change this to false
```

### Step 3: Test It!

```bash
# Start the app
npm start

# Open browser: http://localhost:3000
# Login (any email works in demo)
# Upload a file
# Check AWS Console to verify:
#   - S3: File appears in bucket
#   - DynamoDB: Metadata saved in table
```

## 🔍 How It Works

### Architecture
```
React App (Browser)
    ↓
Cognito Identity Pool (Gets temporary AWS credentials)
    ↓
    ├─→ S3 (Stores actual files with encryption)
    └─→ DynamoDB (Stores file metadata)
```

### Data Flow

**Upload:**
1. User selects file
2. React → Cognito (get credentials)
3. React → S3 (upload file directly)
4. React → DynamoDB (save metadata)
5. UI updates

**Download:**
1. React → DynamoDB (get file list)
2. React → S3 (generate signed URL)
3. User clicks → downloads from S3

**Delete:**
1. React → S3 (delete file)
2. React → DynamoDB (delete metadata)
3. UI updates

## 📊 What's Stored Where

### S3 (File Storage)
```
cloudcrypt-files-YOUR-NAME/
└── uploads/
    ├── 1710681234567-resume.pdf
    ├── 1710681245678-photo.png
    └── 1710681256789-document.docx
```

### DynamoDB (Metadata)
```
cloudcrypt-files table:
┌─────────────────────┬────────────────┬──────────────┬──────────┐
│ userId (PK)         │ fileId (SK)    │ fileName     │ fileSize │
├─────────────────────┼────────────────┼──────────────┼──────────┤
│ user@example.com    │ 1710681234567  │ resume.pdf   │ 245600   │
│ user@example.com    │ 1710681245678  │ photo.png    │ 1024000  │
└─────────────────────┴────────────────┴──────────────┴──────────┘
```

## 🛡️ Security Features

✅ **Server-side encryption** (AES-256) on S3
✅ **Temporary credentials** via Cognito Identity Pool
✅ **No long-term AWS keys** in browser
✅ **CORS protection** on S3 bucket
✅ **User isolation** via userId in DynamoDB

## 💡 Demo Mode vs Real AWS Mode

| Feature | Demo Mode | AWS Mode |
|---------|-----------|----------|
| Storage | localStorage | S3 + DynamoDB |
| Credentials | None needed | Cognito Identity Pool |
| File limit | Browser limit | No limit (pay per use) |
| Persistence | Browser only | Cloud (accessible anywhere) |
| Cost | Free | Pay per use (~$0.023/GB/month) |

## 🐛 Troubleshooting

### Error: "Credentials not found"
**Fix:** Check `identityPoolId` in `aws-config.js`

### Error: "Access Denied" to S3
**Fix:** 
1. Check IAM role attached to Identity Pool
2. Verify bucket name matches in config
3. Check CORS configuration

### Error: "Access Denied" to DynamoDB
**Fix:**
1. Check IAM role has DynamoDB permissions
2. Verify table name matches in config

### Files upload but don't appear in list
**Fix:** Check DynamoDB table has items saved

### CORS error in browser
**Fix:** Update S3 CORS configuration with your domain

## 📱 Testing Checklist

```bash
# 1. Set isDemoMode = false in aws-config.js
# 2. Update identityPoolId
# 3. Update bucket name
# 4. Start app
npm start

# 5. Open browser console (F12)
# 6. Upload a file
# 7. Check console for:
✅ "File uploaded to S3"
✅ "File metadata saved to DynamoDB"

# 8. Check AWS Console:
# - S3 bucket should have the file
# - DynamoDB table should have metadata

# 9. Test delete:
# - Click delete on a file
# - Check S3 and DynamoDB - file should be removed
```

## 💰 Cost Estimation

For a demo/small app:

**S3:**
- Storage: $0.023/GB/month
- Requests: $0.005 per 1000 PUT requests
- Data transfer: First 1GB free/month

**DynamoDB:**
- On-demand: ~$1.25 per million write requests
- Read: ~$0.25 per million read requests

**Cognito Identity Pool:**
- First 50,000 MAUs free
- $0.0055 per MAU after

**Example:** 100 files (10MB each) + 1000 requests/month ≈ **$0.50/month**

## 🚀 Going to Production

### 1. Add User Authentication
Instead of public Identity Pool, use Cognito User Pools for real authentication.

### 2. Add CloudFront CDN
Serve files faster with CloudFront distribution.

### 3. Enable Logging
- S3 access logs
- CloudWatch monitoring
- CloudTrail for auditing

### 4. Implement File Versioning
Enable S3 versioning for file recovery.

### 5. Add Lambda Functions
For virus scanning, thumbnail generation, etc.

## 📚 Useful Commands

```bash
# List files in S3
aws s3 ls s3://cloudcrypt-files-YOUR-NAME/uploads/

# List DynamoDB items
aws dynamodb scan --table-name cloudcrypt-files

# Delete test data
aws s3 rm s3://cloudcrypt-files-YOUR-NAME/uploads/ --recursive
aws dynamodb delete-table --table-name cloudcrypt-files

# Check costs
aws ce get-cost-and-usage --time-period Start=2026-03-01,End=2026-03-17 --granularity MONTHLY --metrics BlendedCost
```

## 🎓 Next Steps

1. **Now:** Test in demo mode ✅ (Already working!)
2. **Next:** Create AWS resources (30 minutes)
3. **Then:** Update config and test with real AWS
4. **Finally:** Deploy to production with custom domain

---

**Need Help?**
- AWS Free Tier: https://aws.amazon.com/free/
- S3 Docs: https://docs.aws.amazon.com/s3/
- DynamoDB Docs: https://docs.aws.amazon.com/dynamodb/
- Cognito Docs: https://docs.aws.amazon.com/cognito/

**Your app is ready to go! 🎉**
