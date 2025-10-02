import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

/**
 * Cloudflare R2 client for audio file storage
 * Context7: Fresh client per request to avoid SSL connection reuse issues
 */

export function getR2Client(): S3Client {
  // Always create a fresh client - don't cache
  // This prevents SSL connection reuse issues
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials not configured')
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    requestHandler: {
      requestTimeout: 900000, // 15 minutes for very large files
      httpsAgent: {
        maxSockets: 1, // Single connection only
        keepAlive: false, // Disable keepAlive to prevent connection reuse
      },
    },
    // Disable SDK retries - we handle retries manually
    maxAttempts: 1,
  })
}

export async function uploadToR2(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const bucketName = process.env.R2_BUCKET_NAME

  if (!bucketName) {
    throw new Error('R2_BUCKET_NAME not configured')
  }

  // Retry logic for SSL/network errors
  const maxRetries = 7 // Increased to 7 for very persistent SSL issues
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Get fresh client for every attempt (no caching, no connection reuse)
      const freshClient = getR2Client()

      await freshClient.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: file,
          ContentType: contentType,
        })
      )

      // Success - return public URL
      const publicDomain = process.env.R2_PUBLIC_DOMAIN || process.env.NEXT_PUBLIC_R2_PUBLIC_URL
      if (publicDomain) {
        // Remove https:// if present
        const domain = publicDomain.replace(/^https?:\/\//, '')
        return `https://${domain}/${key}`
      }

      // Fallback to bucket name (won't work without public access)
      return `https://${bucketName}.r2.dev/${key}`
    } catch (error) {
      lastError = error as Error
      console.error(`[R2 Upload] Attempt ${attempt}/${maxRetries} failed:`, error)

      // Don't retry on client errors (400-499)
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (
        errorMessage.includes('NoSuchBucket') ||
        errorMessage.includes('InvalidAccessKeyId') ||
        errorMessage.includes('SignatureDoesNotMatch') ||
        errorMessage.includes('AccessDenied')
      ) {
        console.error('[R2 Upload] Non-retryable error detected, failing immediately')
        throw error
      }

      // Wait before retry with aggressive exponential backoff
      if (attempt < maxRetries) {
        const baseDelay = Math.min(3000 * Math.pow(1.5, attempt - 1), 15000) // 3s, 4.5s, 6.75s, 10s, 15s...
        const jitter = Math.random() * 2000 // Add up to 2s random jitter
        const delay = baseDelay + jitter

        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(`Upload failed after ${maxRetries} attempts: ${lastError?.message}`)
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client()
  const bucketName = process.env.R2_BUCKET_NAME

  if (!bucketName) {
    throw new Error('R2_BUCKET_NAME not configured')
  }

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  )
}
