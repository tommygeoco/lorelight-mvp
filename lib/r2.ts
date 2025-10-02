import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

/**
 * Cloudflare R2 client for audio file storage
 * Context7: Lazy initialization, environment validation
 */

let r2Client: S3Client | null = null

export function getR2Client(): S3Client {
  if (!r2Client) {
    const accountId = process.env.R2_ACCOUNT_ID
    const accessKeyId = process.env.R2_ACCESS_KEY_ID
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error('R2 credentials not configured')
    }

    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      requestHandler: {
        requestTimeout: 900000, // 15 minutes for very large files
        httpsAgent: {
          maxSockets: 10, // Reduce concurrent connections to avoid SSL issues
          keepAlive: true,
          keepAliveMsecs: 60000, // Keep connections alive for 1 minute
        },
      },
      // SDK retry configuration
      maxAttempts: 5, // SDK-level retries
      retryMode: 'adaptive', // Adaptive retry mode for better handling
    })
  }

  return r2Client
}

export async function uploadToR2(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const client = getR2Client()
  const bucketName = process.env.R2_BUCKET_NAME

  if (!bucketName) {
    throw new Error('R2_BUCKET_NAME not configured')
  }

  // Retry logic for SSL/network errors
  const maxRetries = 5 // Increased from 3 to 5
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Recreate client on retry to get fresh connection
      const freshClient = attempt > 1 ? getR2Client() : client

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

      // Wait before retry with exponential backoff + jitter
      if (attempt < maxRetries) {
        const baseDelay = Math.min(2000 * Math.pow(2, attempt - 1), 10000) // 2s, 4s, 8s, 10s, 10s
        const jitter = Math.random() * 1000 // Add up to 1s random jitter
        const delay = baseDelay + jitter
        console.log(`[R2 Upload] Retrying in ${Math.round(delay)}ms...`)

        // Reset client to force new connection
        r2Client = null

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
