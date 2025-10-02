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
        requestTimeout: 600000, // 10 minutes for large files
        httpsAgent: {
          maxSockets: 25,
        },
      },
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
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await client.send(
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
      console.error(`Upload attempt ${attempt} failed:`, error)

      // Don't retry on certain errors
      if (error instanceof Error && !error.message.includes('SSL') && !error.message.includes('network')) {
        throw error
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        console.log(`Retrying in ${delay}ms...`)
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
