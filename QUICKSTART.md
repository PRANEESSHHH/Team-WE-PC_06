# CloudCrypt - Quick Reference

## Application Structure

### 📱 5 Main Screens/Sections

1. **Login Screen** (`pages/Login.js`)
   - Email/password authentication
   - Login/Signup toggle
   - Demo mode enabled

2. **Dashboard** (`pages/Dashboard.js`)
   - Welcome header
   - Upload button
   - File list display
   - Empty state

3. **Navbar** (`components/Navbar.js`)
   - App logo
   - User email
   - Logout button

4. **Upload Modal** (`components/UploadModal.js`)
   - File selection
   - Drag & drop
   - Progress bar
   - Success state

5. **File Management** (`components/FileList.js` + `FileItem.js`)
   - File listing
   - View/Download
   - Delete action

## 🔄 Complete User Flow

```
START
  ↓
LOGIN PAGE
  ↓ (enter credentials)
VALIDATE
  ↓ (success)
DASHBOARD
  ↓
┌─────────────────┬─────────────────┐
│                 │                 │
UPLOAD FILE    VIEW FILES      DELETE FILE
│                 │                 │
↓                 ↓                 ↓
S3 UPLOAD      FETCH LIST      CONFIRM
│                 │                 │
↓                 ↓                 ↓
DYNAMODB        DISPLAY        S3 DELETE
│                 │                 │
↓                 ↓                 ↓
REFRESH ←────────┴─────────────────┘
  ↓
LOGOUT
  ↓
LOGIN PAGE
```

## 🗂️ File Structure

```
cloud-crypt/
├── src/
│   ├── pages/
│   │   ├── Login.js          ✅ Auth screen
│   │   ├── Login.css
│   │   ├── Dashboard.js      ✅ Main screen
│   │   └── Dashboard.css
│   │
│   ├── components/
│   │   ├── Navbar.js         ✅ Header
│   │   ├── Navbar.css
│   │   ├── UploadModal.js    ✅ Upload popup
│   │   ├── UploadModal.css
│   │   ├── FileList.js       ✅ File container
│   │   ├── FileList.css
│   │   ├── FileItem.js       ✅ Individual file
│   │   └── FileItem.css
│   │
│   ├── services/
│   │   ├── authService.js    ✅ Authentication
│   │   ├── s3Service.js      ✅ S3 operations
│   │   └── dbService.js      ✅ DynamoDB ops
│   │
│   ├── App.js                ✅ Main component
│   ├── App.css
│   └── index.js
│
├── public/
├── README.md                 ✅ Documentation
├── DEVELOPMENT.md            ✅ Dev guide
└── package.json
```

## 🎯 Key Features

### ✅ Implemented
- Clean, modern UI
- Responsive design (mobile/tablet/desktop)
- Login/Signup functionality
- File upload with progress
- File listing with details
- View/Download files
- Delete files with confirmation
- Drag & drop upload
- Form validation
- Loading states
- Empty states
- Success animations

### 🔄 Ready for Integration
- AWS S3 upload
- DynamoDB metadata storage
- AWS Cognito authentication
- CloudFront delivery

## 🚀 Quick Start

```bash
# Navigate to project
cd "d:\Cloudverse Hackathon\CloudCrypt\cloud-crypt"

# Install dependencies (if needed)
npm install

# Start development server
npm start

# Open browser
# http://localhost:3000
```

## 🎨 Design Highlights

- **Color Scheme**: Purple gradient (#667eea → #764ba2)
- **Typography**: System fonts for speed
- **Icons**: Emoji for quick demo
- **Animations**: Smooth transitions
- **Shadows**: Subtle elevation
- **Spacing**: Consistent padding/margins

## 📊 Demo Data

### Test Account
- Email: `demo@cloudcrypt.com` (or any email)
- Password: `password123` (or any password)

### Sample Files
- `resume.pdf` (245 KB)
- `photo.png` (1 MB)

## 🔌 AWS Integration Points

### 1. S3 Service (`services/s3Service.js`)
```javascript
// TODO: Uncomment AWS SDK code
// Configure bucket, region, credentials
```

### 2. DynamoDB Service (`services/dbService.js`)
```javascript
// TODO: Uncomment AWS SDK code
// Configure table name, keys
```

### 3. Auth Service (`services/authService.js`)
```javascript
// TODO: Integrate Cognito
// Configure user pool
```

## 📱 Responsive Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Mobile | < 480px | Stack columns |
| Tablet | 768px - 1199px | 2 columns |
| Desktop | ≥ 1200px | Full grid |

## 🎭 Component Props

### Login
```javascript
<Login onLogin={(email) => {}} />
```

### Dashboard
```javascript
<Dashboard 
  user="user@example.com" 
  onLogout={() => {}} 
/>
```

### Navbar
```javascript
<Navbar 
  user="user@example.com" 
  onLogout={() => {}} 
/>
```

### UploadModal
```javascript
<UploadModal
  onClose={() => {}}
  onUploadComplete={(file) => {}}
/>
```

### FileList
```javascript
<FileList
  files={[]}
  onDelete={(fileId) => {}}
/>
```

### FileItem
```javascript
<FileItem
  file={{id, name, size, uploadDate, url}}
  onDelete={(fileId) => {}}
/>
```

## 🐛 Debug Tips

### Files not loading?
- Check localStorage: `cloudcrypt_files`
- Refresh browser
- Check console for errors

### Login not working?
- Any email/password works in demo
- Check localStorage: `cloudcrypt_user`

### Upload failing?
- File size limit: 50MB
- Check browser console
- Verify file is selected

### Styling broken?
- Clear browser cache
- Check CSS imports
- Verify file names match

## 🎯 Testing Checklist

- [ ] Login works
- [ ] Dashboard loads
- [ ] Upload modal opens
- [ ] File selection works
- [ ] Drag & drop works
- [ ] Progress bar animates
- [ ] File appears in list
- [ ] View button works
- [ ] Delete works
- [ ] Logout works
- [ ] Mobile responsive
- [ ] Tablet responsive

## 📞 Support

- Check `README.md` for detailed docs
- Check `DEVELOPMENT.md` for dev guide
- Review component files for inline docs
- Check service files for integration notes

---

**Status**: ✅ Complete & Demo Ready
**Version**: 1.0.0
**Last Updated**: March 17, 2026
