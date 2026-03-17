# CloudCrypt Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    REACT APP                            │    │
│  │                                                         │    │
│  │  ┌──────────┐  ┌───────────┐  ┌─────────────┐        │    │
│  │  │  Login   │  │ Dashboard │  │ UploadModal │        │    │
│  │  │  Page    │  │   Page    │  │  Component  │        │    │
│  │  └────┬─────┘  └─────┬─────┘  └──────┬──────┘        │    │
│  │       │              │                │                │    │
│  │       └──────────────┴────────────────┘                │    │
│  │                      │                                  │    │
│  │         ┌────────────┴────────────┐                    │    │
│  │         │                         │                    │    │
│  │    ┌────▼─────┐          ┌───────▼────────┐          │    │
│  │    │   Auth   │          │    Services    │          │    │
│  │    │ Service  │          │  - s3Service   │          │    │
│  │    └──────────┘          │  - dbService   │          │    │
│  │                          └────────┬───────┘          │    │
│  │                                   │                   │    │
│  │                          ┌────────▼────────┐         │    │
│  │                          │  aws-config.js  │         │    │
│  │                          │  isDemoMode?    │         │    │
│  │                          └────────┬────────┘         │    │
│  │                                   │                   │    │
│  │                    ┌──────────────┴──────────────┐   │    │
│  │                    │                             │   │    │
│  │              [TRUE]│                        [FALSE]  │    │
│  │                    │                             │   │    │
│  └────────────────────┼─────────────────────────────┼───┘    │
│                       │                             │        │
│               ┌───────▼────────┐          ┌─────────▼────────┐│
│               │  localStorage  │          │    AWS SDK       ││
│               │  (Demo Mode)   │          │  (Production)    ││
│               └────────────────┘          └─────────┬────────┘│
└─────────────────────────────────────────────────────┼─────────┘
                                                      │
                                                      │
                         ┌────────────────────────────┼─────────────┐
                         │         AWS CLOUD          │             │
                         │                            │             │
                         │   ┌────────────────────────▼──────────┐  │
                         │   │   AWS Cognito Identity Pool       │  │
                         │   │  (Temporary Credentials)          │  │
                         │   └────────────┬──────────────────────┘  │
                         │                │                          │
                         │     ┌──────────┴──────────┐              │
                         │     │                     │              │
                         │ ┌───▼─────────┐   ┌──────▼─────────┐    │
                         │ │   AWS S3    │   │  AWS DynamoDB  │    │
                         │ │             │   │                │    │
                         │ │  File       │   │  File          │    │
                         │ │  Storage    │   │  Metadata      │    │
                         │ │             │   │                │    │
                         │ │ ┌─────────┐ │   │ ┌────────────┐ │    │
                         │ │ │ resume  │ │   │ │userId      │ │    │
                         │ │ │ .pdf    │ │   │ │fileId      │ │    │
                         │ │ ├─────────┤ │   │ │fileName    │ │    │
                         │ │ │ photo   │ │   │ │fileSize    │ │    │
                         │ │ │ .png    │ │   │ │uploadDate  │ │    │
                         │ │ ├─────────┤ │   │ │s3Key       │ │    │
                         │ │ │ doc     │ │   │ │s3Url       │ │    │
                         │ │ │ .docx   │ │   │ └────────────┘ │    │
                         │ │ └─────────┘ │   │                │    │
                         │ │             │   │                │    │
                         │ │ 🔒 AES-256  │   │  NoSQL Table   │    │
                         │ │ Encrypted   │   │                │    │
                         │ └─────────────┘   └────────────────┘    │
                         │                                          │
                         └──────────────────────────────────────────┘
```

## 📊 Data Flow Diagrams

### Upload Flow

```
1. User selects file
        │
        ▼
2. UploadModal.js
        │
        ├─────────────────────────┐
        │                         │
        ▼                         ▼
3. s3Service.js           4. Wait for S3 upload
        │                         │
        ▼                         │
5. AWS SDK → S3 Bucket            │
        │                         │
        ├─────────────────────────┘
        │
        ▼
6. dbService.js
        │
        ▼
7. AWS SDK → DynamoDB
        │
        ▼
8. Success! → Update UI
```

### Fetch Files Flow

```
1. Dashboard.js mounts
        │
        ▼
2. fetchFiles()
        │
        ▼
3. dbService.getFilesFromDynamoDB()
        │
        ▼
4. AWS SDK → Query DynamoDB
        │
        ▼
5. Receive file metadata array
        │
        ▼
6. Update state → Render FileList
```

### Delete Flow

```
1. User clicks delete
        │
        ▼
2. Confirm dialog
        │
        ▼
3. Dashboard.handleDelete()
        │
        ├─────────────────────────┐
        │                         │
        ▼                         ▼
4. s3Service.deleteFromS3()   5. dbService.deleteFileFromDynamoDB()
        │                         │
        ▼                         ▼
6. AWS SDK → Delete from S3   7. AWS SDK → Delete from DynamoDB
        │                         │
        ├─────────────────────────┘
        │
        ▼
8. Update UI (remove from list)
```

## 🔐 Authentication Flow (Demo Mode)

```
1. User enters email/password
        │
        ▼
2. Login.js validates format
        │
        ▼
3. authService.login() [DEMO]
        │
        ▼
4. Store in localStorage
        │
        ▼
5. App.js updates state
        │
        ▼
6. Render Dashboard
```

## 🔐 Authentication Flow (AWS Mode - Future)

```
1. User enters email/password
        │
        ▼
2. Login.js validates format
        │
        ▼
3. authService.login() → AWS Cognito
        │
        ▼
4. Cognito User Pool verifies
        │
        ▼
5. Returns JWT tokens
        │
        ▼
6. Exchange for Identity Pool credentials
        │
        ▼
7. Store tokens & credentials
        │
        ▼
8. App.js updates state
        │
        ▼
9. Render Dashboard with AWS access
```

## 🗂️ File Structure

```
src/
├── 📄 App.js                    Main app component (routing logic)
├── 📄 aws-config.js             ⭐ AWS configuration (UPDATE THIS!)
│
├── 📁 pages/
│   ├── 📄 Login.js              Login/Signup screen
│   └── 📄 Dashboard.js          Main dashboard (file management)
│
├── 📁 components/
│   ├── 📄 Navbar.js             Top navigation bar
│   ├── 📄 UploadModal.js        File upload dialog
│   ├── 📄 FileList.js           List of files (container)
│   └── 📄 FileItem.js           Individual file row
│
└── 📁 services/
    ├── 📄 authService.js        Authentication logic
    ├── 📄 s3Service.js          ⭐ S3 operations (upload/delete/download)
    └── 📄 dbService.js          ⭐ DynamoDB operations (CRUD)
```

## 🔄 State Management

```
App.js
├── user: string | null
└── loading: boolean

Dashboard.js
├── files: Array<File>
├── isUploadModalOpen: boolean
└── loading: boolean

Login.js
├── email: string
├── password: string
├── isSignup: boolean
└── error: string

UploadModal.js
├── selectedFile: File | null
├── uploading: boolean
├── uploadProgress: number (0-100)
└── success: boolean
```

## 💾 Storage Schema

### localStorage (Demo Mode)

```javascript
// Key: cloudcrypt_user
{
  "email": "user@example.com",
  "userId": "user_1710681234567"
}

// Key: cloudcrypt_files
[
  {
    "id": "1710681234567",
    "name": "resume.pdf",
    "size": 245600,
    "uploadDate": "2026-03-17T10:00:00.000Z",
    "url": "blob:http://localhost:3000/xxx",
    "key": "uploads/1710681234567-resume.pdf"
  }
]
```

### DynamoDB Schema (AWS Mode)

```
Table: cloudcrypt-files

Partition Key: userId (String)
Sort Key: fileId (String)

Attributes:
- userId: "user@example.com"
- fileId: "1710681234567"
- fileName: "resume.pdf"
- fileSize: 245600
- uploadDate: "2026-03-17T10:00:00.000Z"
- s3Key: "uploads/1710681234567-resume.pdf"
- s3Url: "https://signed-url..."
- contentType: "application/pdf"
- createdAt: "2026-03-17T10:00:00.000Z"

Indexes: None (query by userId)
Billing: On-Demand
```

### S3 Structure (AWS Mode)

```
Bucket: cloudcrypt-files-YOUR-NAME
Region: us-east-1
Encryption: AES-256

uploads/
├── 1710681234567-resume.pdf
├── 1710681245678-photo.png
├── 1710681256789-document.docx
└── 1710681267890-video.mp4

Access: Private (signed URLs only)
CORS: Enabled for localhost:3000
```

## 🔒 Security Model

```
┌─────────────┐
│   Browser   │
│   (React)   │
└──────┬──────┘
       │
       │ 1. Request credentials
       ▼
┌─────────────────────┐
│  Cognito Identity   │
│       Pool          │ ← IAM Role attached
└──────┬──────────────┘
       │
       │ 2. Return temporary credentials
       │    (AccessKeyId, SecretKey, SessionToken)
       │    Valid for 1 hour
       ▼
┌─────────────┐
│   Browser   │
│   (React)   │
└──────┬──────┘
       │
       │ 3. Use credentials to access
       │
       ├──────────────┬──────────────┐
       │              │              │
       ▼              ▼              ▼
   ┌──────┐      ┌──────┐      ┌──────┐
   │  S3  │      │ DDB  │      │ etc  │
   └──────┘      └──────┘      └──────┘

No long-term credentials stored!
Credentials expire and refresh automatically.
```

## 📈 Performance Optimization

```
Current Setup:
- Direct browser → AWS (no server needed!)
- Files streamed directly to S3
- Parallel uploads possible
- Signed URLs for fast downloads

Future Improvements:
- Add CloudFront CDN (faster global access)
- Enable S3 Transfer Acceleration (faster uploads)
- Implement file chunking (upload large files)
- Add thumbnail generation (Lambda)
- Cache DynamoDB queries (reduce costs)
```

## 💰 Cost Breakdown

```
AWS Free Tier (12 months):
├── S3: 5GB storage, 20,000 GET, 2,000 PUT
├── DynamoDB: 25GB storage, 25 WCU, 25 RCU
└── Cognito: 50,000 MAUs (Monthly Active Users)

After Free Tier:
├── S3: ~$0.023/GB/month + $0.005/1000 PUT
├── DynamoDB: ~$1.25/million writes, $0.25/million reads
└── Cognito: $0.0055 per MAU

Example: 1000 files (10GB total), 10,000 operations/month
Cost: ~$1-2/month
```

---

## 🎯 Quick Commands

```bash
# Start development
npm start

# Build production
npm run build

# Install dependencies
npm install

# View logs
# Check browser console (F12)
```

---

**Your app architecture is production-ready!** 🚀
