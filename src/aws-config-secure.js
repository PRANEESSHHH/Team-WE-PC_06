import AWS from "aws-sdk";

// Use environment variables for security
// IMPORTANT: Never commit actual credentials to Git!
AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || "YOUR_ACCESS_KEY_HERE",
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || "YOUR_SECRET_KEY_HERE",
  region: process.env.REACT_APP_AWS_REGION || "ap-south-1"
});

export default AWS;
