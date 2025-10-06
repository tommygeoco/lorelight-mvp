import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { NodeHttpHandler } from '@smithy/node-http-handler'
import https from 'https'

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

  // Create custom HTTPS agent with aggressive settings for SSL stability
  const httpsAgent = new https.Agent({
    keepAlive: false, // Disable keep-alive to prevent SSL connection reuse
    maxSockets: 1, // Single connection only
    timeout: 900000, // 15 minutes
    // Force TLS 1.2+ to avoid SSL v3 issues
    minVersion: 'TLSv1.2',
    // Disable session reuse to prevent MAC errors
    sessionIdContext: undefined,
  })

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    requestHandler: new NodeHttpHandler({
      requestTimeout: 900000, // 15 minutes for very large files
      httpsAgent,
      connectionTimeout: 30000, // 30s to establish connection
    }),
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
  const maxRetries = 5 // Reduced to 5 with longer waits
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Get fresh client for every attempt (no caching, no connection reuse)
      const freshClient = getR2Client()

      console.log(`[R2 Upload] Attempt ${attempt}/${maxRetries} for file: ${key} (${(file.length / 1024 / 1024).toFixed(2)} MB)`)

      await freshClient.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: file,
          ContentType: contentType,
        })
      )

      console.log(`[R2 Upload] ✓ Success on attempt ${attempt}`)

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
      const errorMessage = error instanceof Error ? error.message : String(error)

      console.error(`[R2 Upload] ✗ Attempt ${attempt}/${maxRetries} failed`)
      console.error(`[R2 Upload] Error type: ${error instanceof Error ? error.name : 'Unknown'}`)
      console.error(`[R2 Upload] Error message: ${errorMessage}`)

      // Don't retry on client errors (400-499)
      if (
        errorMessage.includes('NoSuchBucket') ||
        errorMessage.includes('InvalidAccessKeyId') ||
        errorMessage.includes('SignatureDoesNotMatch') ||
        errorMessage.includes('AccessDenied')
      ) {
        console.error('[R2 Upload] Non-retryable authentication/config error detected')
        throw error
      }

      // Wait before retry with longer exponential backoff for SSL issues
      if (attempt < maxRetries) {
        // Longer delays: 5s, 10s, 20s, 40s
        const baseDelay = Math.min(5000 * Math.pow(2, attempt - 1), 60000)
        const jitter = Math.random() * 2000 // Add up to 2s random jitter
        const delay = baseDelay + jitter

        console.log(`[R2 Upload] Waiting ${(delay / 1000).toFixed(1)}s before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  console.error(`[R2 Upload] All ${maxRetries} attempts exhausted`)
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
