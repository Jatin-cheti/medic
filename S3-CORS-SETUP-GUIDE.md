# 🎯 S3 CORS Configuration Guide

## Apply CORS Policy to S3 Bucket (medic-data)

### Step 1: Open AWS S3 Console
1. Go to https://s3.console.aws.amazon.com/
2. Find and click on bucket: **medic-data**

### Step 2: Configure CORS
1. Click on the **Permissions** tab
2. Scroll down to **Cross-origin resource sharing (CORS)**
3. Click **Edit**
4. **Delete any existing CORS configuration**
5. **Copy and paste** the entire content from `S3-CORS-POLICY.json`
6. Click **Save changes**

### Step 3: Verify CORS Configuration
Your CORS configuration should now allow:
- ✅ PUT, GET, POST, DELETE, HEAD methods
- ✅ All headers (Authorization, Content-Type, etc.)
- ✅ Requests from Vercel domains and localhost
- ✅ Pre-signed URL uploads

### What This Fixes
- ✅ Profile image upload via pre-signed URLs
- ✅ Direct browser uploads to S3
- ✅ No more CORS errors on PUT requests
- ✅ Proper handling of Authorization headers

### Troubleshooting
If CORS errors persist:
1. Clear browser cache and cookies
2. Check browser console for exact error message
3. Verify the S3 bucket name matches: `medic-data`
4. Ensure bucket is in region: `eu-north-1`

---

## Alternative: Using AWS CLI

```bash
aws s3api put-bucket-cors --bucket medic-data --cors-configuration file://S3-CORS-POLICY.json
```

---

## Verify Applied CORS

```bash
aws s3api get-bucket-cors --bucket medic-data
```
