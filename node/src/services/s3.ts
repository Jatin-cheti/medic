import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'medic-profiles';

export async function generatePresignedUploadUrl(
  userId: string,
  fileName: string,
  fileType: string
): Promise<string> {
  try {
    const key = `profiles/${userId}/${Date.now()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate upload URL');
  }
}

export async function generatePresignedDownloadUrl(key: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error('Error generating download URL:', error);
    throw new Error('Failed to generate download URL');
  }
}

export function extractS3KeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const key = urlObj.pathname.replace(`/${BUCKET_NAME}/`, '');
    return key || null;
  } catch {
    return null;
  }
}

export async function deleteS3Object(key: string): Promise<void> {
  try {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting S3 object:', error);
    throw new Error('Failed to delete file');
  }
}

export const S3Service = {
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  extractS3KeyFromUrl,
  deleteS3Object,
};
