# AWS S3 Integration Setup Guide

## Overview
Your Medic application now has AWS S3 integration for profile picture uploads. Follow these steps to complete the setup.

## Prerequisites
- AWS Account with S3 bucket access
- IAM user credentials (Access Key ID and Secret Access Key)
- Railway CLI installed
- Your credentials stored securely

## Setup Steps

### Step 1: Retrieve Your AWS Credentials

You should have received your AWS credentials:
- Access Key ID: `AKIASX...`
- Secret Access Key: (provided separately)
- S3 Bucket: `medic-data`
- Region: `eu-north-1`

**⚠️ SECURITY**: Never share these credentials. Keep them confidential.

###  Step 2: Set Environment Variables on Railway

Run the following commands from your `node` directory:

```bash
cd C:\Users\NEHA\OneDrive\Desktop\Medic\node

railway variables set AWS_REGION=eu-north-1
railway variables set AWS_S3_BUCKET=medic-data
railway variables set AWS_ACCESS_KEY_ID=<your-access-key>
railway variables set AWS_SECRET_ACCESS_KEY=<your-secret-key>
```

Replace `<your-access-key>` and `<your-secret-key>` with your actual values.

Verify they were set:
```bash
railway variables list | grep AWS_
```

### Step 3: Redeploy Backend

```bash
cd C:\Users\NEHA\OneDrive\Desktop\Medic\node
railway up
```

Wait for deployment to complete successfully.

##  How S3 Integration Works

### User Flow
1. User navigates to "My Profile"
2. Click "Edit Profile"
3. Click camera icon on profile picture
4. Select image file (JPEG, PNG, WebP - max 5MB)
5. Click "Upload Picture"
6. Image uploads directly to S3
7. Profile picture updates immediately

### Technical Architecture

**Frontend (Angular)**:
- Validates file type and size
- Requests presigned URL from backend
- Uploads directly to S3 using the presigned URL
- Updates avatar URL in backend database

**Backend (Node.js/Express)**:
- `POST /api/profile/avatar-upload-url` - Generates S3 presigned URL
- `PUT /api/profile/avatar` - Updates avatar URL in database
- `S3Service` - Handles AWS SDK interactions

**AWS S3**:
- Bucket: `medic-data` (eu-north-1)
- Path: `profiles/{userId}/{timestamp}-{filename}`
- Presigned URLs expire in 1 hour

## Features

✅ Direct S3 upload (no backend file streaming)
✅ Presigned URLs (secure, time-limited)
✅ File type validation (JPEG, PNG, WebP)
✅ File size limit (5MB)
✅ User-specific folders in S3
✅ Automatic database updates
✅ Error handling and logging

## Testing

1. Login to your app
2. Navigate to "My Profile"
3. Click "Edit"
4. Select and upload a profile picture
5. Verify it displays immediately
6. Check S3 bucket to confirm file upload

##  Troubleshooting

**"Failed to generate upload URL"**
- Verify all 4 AWS environment variables are set on Railway
- Check credentials are correct
- Redeploy backend: `railway up`

**"Access Denied" on S3 upload**
- Verify IAM user has S3 permissions
- Confirm credentials are active in AWS
- Check region is `eu-north-1`

**Image doesn't persist after upload**
- Check browser console for errors
- Verify JWT token is still valid
- Ensure PUT /api/profile/avatar request succeeded

## Environment Variables Reference

```
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=[your-access-key-id]
AWS_SECRET_ACCESS_KEY=[your-secret-access-key]
AWS_S3_BUCKET=medic-data
```

These are automatically used by the S3Service in your backend.

## Security Notes

- **Never commit credentials to GitHub**
- Use Railway's secure environment variable storage
- Presigned URLs are single-use and time-limited
- S3 bucket should have proper access policies
- Regularly rotate IAM access keys

## Next Steps

After deploying with AWS credentials:
1. Test profile picture upload
2. Verify images appear in your S3 bucket
3. Monitor logs for any errors
4. Ensure user authentication is working

For issues or questions, check the backend logs:
```bash
railway logs
```
