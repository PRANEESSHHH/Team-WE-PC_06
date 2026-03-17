# CloudCrypt Development Guide

## Quick Start Checklist

- [x] Project structure created
- [x] All components built
- [x] All pages created
- [x] Services layer ready
- [x] Responsive design implemented
- [ ] AWS integration (optional for demo)

## Component Overview

### Pages

#### `Login.js`
- Handles authentication UI
- Form validation
- Toggle between login/signup
- Demo mode enabled
- Props: `onLogin(email)`

#### `Dashboard.js`
- Main application screen
- Fetches and displays files
- Manages upload modal state
- Handles file deletion
- Props: `user`, `onLogout()`

### Components

#### `Navbar.js`
- Sticky navigation bar
- Displays user email
- Logout button
- Props: `user`, `onLogout()`

#### `UploadModal.js`
- Popup modal for file upload
- Drag and drop support
- Progress bar
- Success animation
- Props: `onClose()`, `onUploadComplete(file)`

#### `FileList.js`
- Container for file items
- Grid header
- Maps file array
- Props: `files[]`, `onDelete(fileId)`

#### `FileItem.js`
- Individual file row
- File icon based on type
- View and delete actions
- Responsive layout
- Props: `file`, `onDelete(fileId)`

### Services

#### `authService.js`
Functions:
- `login(email, password)` - Authenticate user
- `signup(email, password)` - Register user
- `logout()` - Clear session
- `getCurrentUser()` - Get stored user
- `isAuthenticated()` - Check auth status

#### `s3Service.js`
Functions:
- `uploadToS3(file)` - Upload to S3
- `deleteFromS3(fileKey)` - Delete from S3
- `getSignedUrl(fileKey)` - Get download URL

#### `dbService.js`
Functions:
- `saveFileToDynamoDB(metadata)` - Save file info
- `getFilesFromDynamoDB(userId)` - Fetch files
- `deleteFileFromDynamoDB(userId, fileId)` - Delete file

## State Management

### App.js
```javascript
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
```

### Dashboard.js
```javascript
const [files, setFiles] = useState([]);
const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
const [loading, setLoading] = useState(true);
```

### Login.js
```javascript
const [isSignup, setIsSignup] = useState(false);
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
```

### UploadModal.js
```javascript
const [selectedFile, setSelectedFile] = useState(null);
const [uploading, setUploading] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
const [success, setSuccess] = useState(false);
```

## Data Flow

### Login Flow
```
1. User enters credentials
2. Form validation
3. Login.js calls onLogin(email)
4. App.js updates user state
5. Dashboard rendered
```

### Upload Flow
```
1. User clicks "Upload File"
2. Dashboard opens UploadModal
3. User selects file
4. UploadModal calls uploadToS3() (service)
5. UploadModal calls saveFileToDynamoDB() (service)
6. UploadModal calls onUploadComplete(fileData)
7. Dashboard updates files state
8. FileList re-renders
```

### Delete Flow
```
1. User clicks delete button
2. Confirmation dialog
3. Dashboard calls deleteFromS3() (service)
4. Dashboard calls deleteFileFromDynamoDB() (service)
5. Dashboard updates files state
6. FileList re-renders
```

## Storage Structure

### localStorage Keys

#### `cloudcrypt_user`
```json
{
  "email": "user@example.com",
  "userId": "user_1234567890"
}
```

#### `cloudcrypt_files`
```json
[
  {
    "id": "1710681600000",
    "name": "resume.pdf",
    "size": 245600,
    "uploadDate": "2026-03-17T10:00:00.000Z",
    "url": "blob:http://localhost:3000/..."
  }
]
```

## Styling Guide

### Color Palette
- Primary: `#667eea` (Purple)
- Secondary: `#764ba2` (Dark Purple)
- Background: `#f5f7fa` (Light Gray)
- Text: `#333` (Dark Gray)
- Accent: `#999` (Medium Gray)

### Gradients
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Border Radius
- Cards: `16px - 20px`
- Buttons: `8px - 12px`
- Inputs: `10px`

### Shadows
```css
/* Subtle */
box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

/* Medium */
box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

/* Strong */
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
```

### Transitions
```css
transition: all 0.3s ease;
```

### Hover Effects
```css
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}
```

## Responsive Breakpoints

```css
/* Desktop */
@media (min-width: 1200px) { }

/* Tablet */
@media (max-width: 768px) { }

/* Mobile */
@media (max-width: 480px) { }
```

## File Type Icons

```javascript
const iconMap = {
  pdf: '📄',
  doc: '📝',
  docx: '📝',
  txt: '📝',
  jpg: '🖼️',
  jpeg: '🖼️',
  png: '🖼️',
  gif: '🖼️',
  mp4: '🎥',
  mp3: '🎵',
  zip: '📦',
  rar: '📦',
  default: '📎'
};
```

## Testing Checklist

### Authentication
- [ ] Login with valid email
- [ ] Signup toggle works
- [ ] Error messages display
- [ ] Session persists on reload
- [ ] Logout clears session

### Dashboard
- [ ] Files load on mount
- [ ] Empty state shows when no files
- [ ] Loading spinner appears
- [ ] Upload button opens modal
- [ ] User name displays correctly

### Upload
- [ ] File selection works
- [ ] Drag and drop works
- [ ] Progress bar animates
- [ ] Success message shows
- [ ] File appears in list

### File Management
- [ ] Files display in list
- [ ] File details are correct
- [ ] View button works
- [ ] Delete confirmation shows
- [ ] File removed from list

### Responsive
- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works
- [ ] All buttons are clickable
- [ ] Text is readable

## Common Issues

### Issue: Files not showing
**Solution**: Check localStorage or refresh data

### Issue: Upload not working
**Solution**: Check file size (max 50MB in demo)

### Issue: Login not persisting
**Solution**: Check localStorage is enabled

### Issue: Styling issues
**Solution**: Check CSS import order in components

## AWS Integration Steps

### 1. Install AWS SDK
```bash
npm install aws-sdk @aws-amplify/storage
```

### 2. Configure Amplify
```bash
amplify init
amplify add auth
amplify add storage
amplify push
```

### 3. Update Services
- Uncomment AWS code in service files
- Add proper error handling
- Test with real AWS resources

### 4. Environment Variables
Create `.env` file:
```
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=your-pool-id
REACT_APP_IDENTITY_POOL_ID=your-identity-pool-id
REACT_APP_S3_BUCKET=your-bucket-name
```

## Performance Tips

1. Use React.memo for FileItem
2. Implement virtual scrolling for large file lists
3. Lazy load images/previews
4. Add debouncing to search
5. Cache file metadata
6. Use CDN for static assets

## Security Best Practices

1. Never store passwords in localStorage
2. Use HTTPS in production
3. Implement CSRF protection
4. Validate file types on upload
5. Scan files for malware
6. Set proper S3 bucket permissions
7. Use presigned URLs with expiry
8. Enable CloudFront for content delivery

## Next Steps

1. Add file search/filter
2. Add file preview modal
3. Add download progress
4. Add multiple file upload
5. Add file sharing
6. Add folder organization
7. Add file versioning
8. Add encryption key management

## Helpful Commands

```bash
# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test

# Check for issues
npm run lint

# Format code
npm run format
```

---

Happy Coding! 🚀
