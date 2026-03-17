# ☁️🔐 CloudCrypt - Encrypted Cloud Storage

A modern, secure cloud storage application built with React and AWS services. CloudCrypt provides encrypted file storage with an intuitive user interface.

## 🎯 Features

- **Secure Authentication** - User login and signup
- **Encrypted File Storage** - Files stored securely in AWS S3 with encryption
- **File Management** - Upload, view, and delete files
- **Beautiful UI** - Modern, responsive design
- **Real-time Updates** - Instant file list updates after operations

## 📁 Project Structure

```
src/
├── pages/
│   ├── Login.js              # Authentication screen
│   ├── Login.css
│   ├── Dashboard.js          # Main dashboard
│   └── Dashboard.css
│
├── components/
│   ├── Navbar.js             # Navigation bar
│   ├── Navbar.css
│   ├── UploadModal.js        # File upload modal
│   ├── UploadModal.css
│   ├── FileList.js           # File list container
│   ├── FileList.css
│   ├── FileItem.js           # Individual file item
│   └── FileItem.css
│
├── services/
│   ├── s3Service.js          # AWS S3 operations
│   ├── dbService.js          # DynamoDB operations
│   └── authService.js        # Authentication logic
│
├── App.js                    # Main app component
└── App.css                   # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- AWS Account (for production deployment)

### Installation

1. **Clone the repository**
   ```bash
   cd cloud-crypt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎨 UI Screens

### 1. Login Screen
- Email and password input
- Toggle between login and signup
- Form validation
- Demo mode enabled (any credentials work)

### 2. Dashboard
- Welcome header with user name
- Upload file button
- File list with sorting
- View and delete actions

### 3. Upload Modal
- Drag and drop support
- File selection
- Upload progress bar
- Success confirmation

### 4. File List
- Grid layout with file details
- File name, date, size
- View/Download button
- Delete button with confirmation

## 🔄 User Flow

```
Login → Dashboard → Upload → View Files → Delete Files
  ↓
Logout
```

## 🛠️ AWS Integration (TODO)

The application is currently in demo mode. To integrate with AWS services:

### 1. Configure AWS Amplify

Update `src/aws-exports.js` with your AWS configuration:

```javascript
const awsconfig = {
  Auth: {
    region: 'your-region',
    userPoolId: 'your-user-pool-id',
    userPoolWebClientId: 'your-client-id',
  },
  Storage: {
    AWSS3: {
      bucket: 'your-bucket-name',
      region: 'your-region',
    }
  }
};
```

### 2. Update S3 Service

Uncomment the AWS SDK code in `src/services/s3Service.js`:

```javascript
import AWS from 'aws-sdk';

AWS.config.update({
  region: 'your-region',
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'your-identity-pool-id',
  })
});
```

### 3. Update DynamoDB Service

Configure DynamoDB in `src/services/dbService.js`:

```javascript
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: 'your-region'
});

const TABLE_NAME = 'cloudcrypt-files';
```

### 4. DynamoDB Table Schema

Create a table with the following schema:

```
Table Name: cloudcrypt-files
Primary Key: userId (String)
Sort Key: fileId (String)

Attributes:
- userId (String)
- fileId (String)
- fileName (String)
- fileSize (Number)
- uploadDate (String)
- s3Key (String)
- s3Url (String)
```

## 🎯 Demo Mode

Currently, the app runs in demo mode:

- ✅ Any email/password combination works for login
- ✅ Files are stored in localStorage
- ✅ All UI features are functional
- ⚠️ No actual AWS integration (yet)

## 🔒 Security Features

- **Client-side encryption** ready
- **Server-side encryption** (S3 AES256)
- **Secure authentication** flow
- **Session management**
- **Input validation**

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🧪 Testing

The app has been designed with demo data for easy testing:

1. **Login**: Use any email (e.g., `demo@cloudcrypt.com`) and password
2. **Upload**: Click "Upload File" and select any file
3. **View**: Files appear instantly in the list
4. **Delete**: Click delete and confirm

## 📦 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## 🚀 Deployment

### Deploy to AWS Amplify

```bash
npm install -g @aws-amplify/cli
amplify init
amplify add hosting
amplify publish
```

### Deploy to Netlify/Vercel

Simply connect your repository and deploy!

## 🎨 Customization

### Change Colors

Update the gradient colors in CSS files:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Change App Name

Update in:
- `Login.js` - Logo text
- `Navbar.js` - Brand name
- `public/index.html` - Page title

## 📄 License

MIT License - feel free to use this project for your hackathon or portfolio!

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for Cloudverse Hackathon**
