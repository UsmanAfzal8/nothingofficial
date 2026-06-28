import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const REPORT_PATH = path.join(ROOT, 'tmp', 'phone-4b-homepage-media.json')
const CLOUDINARY_FOLDER = 'nothing-official-store-pakistan/home/phone-4b-launch'

const IMAGE_ASSETS = [
  {
    key: 'summerSale',
    publicId: 'summer-sale-homepage',
    url: 'https://cdn.sanity.io/images/gtd4w1cq/production/50cbd1e1520f5f87b785c8e466ace91d1a4123fc-4096x2305.webp?auto=format',
  },
  {
    key: 'phone4b',
    publicId: 'nothing-phone-4b-blue-homepage',
    url: 'https://cdn.sanity.io/images/gtd4w1cq/production/8ebfa30ebe63fb1dea7a10bddcfc33239d0a31ce-4096x2305.webp?auto=format',
  },
  {
    key: 'phone4aPro',
    publicId: 'nothing-phone-4a-pro-homepage',
    url: 'https://cdn.sanity.io/images/gtd4w1cq/production/d537f4c841503edee2f704a0a279697e8a1ce909-4096x2305.jpg?auto=format',
  },
  {
    key: 'phone4a',
    publicId: 'nothing-phone-4a-homepage',
    url: 'https://cdn.sanity.io/images/gtd4w1cq/production/d2a928661850d77fa8db5489eb53af14990639e8-4096x2305.jpg?auto=format',
  },
  {
    key: 'headphone1',
    publicId: 'nothing-headphone-1-homepage',
    url: 'https://cdn.sanity.io/images/gtd4w1cq/production/1cb755a0792e7ee8611c70b56e2f08fad95ce0d4-4096x2305.jpg?auto=format',
  },
  {
    key: 'phone3',
    publicId: 'nothing-phone-3-homepage',
    url: 'https://cdn.sanity.io/images/gtd4w1cq/production/4ef2af4fc4259cb398efe107002fca5355159f73-4096x2305.jpg?auto=format',
  },
  {
    key: 'phone4aProProduct',
    publicId: 'nothing-phone-4a-pro-product',
    url: 'https://cdn.shopify.com/s/files/1/0376/5420/0459/files/Phone-4a-Pro-White.png?v=1771948315',
  },
  {
    key: 'phone4aProduct',
    publicId: 'nothing-phone-4a-product',
    url: 'https://cdn.shopify.com/s/files/1/0376/5420/0459/files/Phone-4a-White.png?v=1771948069',
  },
  {
    key: 'headphoneAProduct',
    publicId: 'nothing-headphone-a-product',
    url: 'https://cdn.shopify.com/s/files/1/0376/5420/0459/files/Headphone-a-white.png?v=1771948423',
  },
  {
    key: 'headphone1Product',
    publicId: 'nothing-headphone-1-product',
    url: 'https://cdn.shopify.com/s/files/1/0376/5420/0459/files/0000s_0021_Headphone1-white.png?v=1753434394',
  },
  {
    key: 'ear3Product',
    publicId: 'nothing-ear-3-product',
    url: 'https://cdn.shopify.com/s/files/1/0376/5420/0459/files/Ear3-white_9c7c5465-3f29-4bb9-a438-7883444a6bad.png?v=1756911995',
  },
  {
    key: 'phone3Product',
    publicId: 'nothing-phone-3-product',
    url: 'https://cdn.shopify.com/s/files/1/0376/5420/0459/files/0000s_0011_Phone-3-white.png?v=1753434595',
  },
]

const VIDEO_ASSETS = [
  {
    key: 'headphoneAVideo',
    publicId: 'nothing-headphone-a-homepage-video',
    playbackId: 'YyShYNODGr4h32ZboJDckdXSLuhe02FEeR9Nd8ps2XeE',
  },
  {
    key: 'ear3Video',
    publicId: 'nothing-ear-3-homepage-video',
    playbackId: 'dJdK7afxMjc01yaXFLOYTtSE9XmwbH8BQ8bCeMhCxWqc',
  },
]

function loadEnv() {
  for (const envPath of ['.env.local', 'env']) {
    const fullPath = path.join(ROOT, envPath)
    if (!existsSync(fullPath)) continue
    for (const line of readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
      const index = trimmed.indexOf('=')
      const key = trimmed.slice(0, index).trim()
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')
      process.env[key] ||= value
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment value: ${name}`)
  return value
}

function cloudinarySignature(params, apiSecret) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return createHash('sha1').update(`${payload}${apiSecret}`).digest('hex')
}

async function fetchBuffer(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to download ${url}: HTTP ${response.status}`)
  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get('content-type') || 'application/octet-stream',
  }
}

async function downloadMuxVideo(playbackId) {
  const masterUrl = `https://stream.mux.com/${playbackId}.m3u8?min_resolution=1080p&redundant_streams=true`
  const masterResponse = await fetch(masterUrl)
  if (!masterResponse.ok) throw new Error(`Failed to fetch Mux master playlist: HTTP ${masterResponse.status}`)
  const master = await masterResponse.text()
  const renditionUrl = master
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith('https://') && line.includes('rendition.m3u8'))
  if (!renditionUrl) throw new Error(`No rendition found for Mux playback ${playbackId}`)

  const renditionResponse = await fetch(renditionUrl)
  if (!renditionResponse.ok) throw new Error(`Failed to fetch Mux rendition: HTTP ${renditionResponse.status}`)
  const rendition = await renditionResponse.text()
  const segmentUrls = rendition
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('https://') && line.includes('.ts'))
  if (!segmentUrls.length) throw new Error(`No video segments found for Mux playback ${playbackId}`)

  const segments = []
  for (const segmentUrl of segmentUrls) {
    const { buffer } = await fetchBuffer(segmentUrl)
    segments.push(buffer)
  }
  return Buffer.concat(segments)
}

async function uploadAsset({ buffer, contentType, fileName, publicId, resourceType }) {
  const cloudName = requireEnv('CLOUDINARY_CLOUD_NAME')
  const apiKey = requireEnv('CLOUDINARY_API_KEY')
  const apiSecret = requireEnv('CLOUDINARY_API_SECRET')
  const timestamp = Math.floor(Date.now() / 1000)
  const params = {
    context: `brand=Nothing Pakistan|campaign=Phone 4b launch|source=Nothing homepage|site=nothingpakistan.pk`,
    folder: CLOUDINARY_FOLDER,
    overwrite: 'true',
    public_id: publicId,
    tags: 'nothing-pakistan,phone-4b,homepage,campaign',
    timestamp,
  }
  const formData = new FormData()
  formData.set('file', new Blob([buffer], { type: contentType }), fileName)
  formData.set('api_key', apiKey)
  formData.set('context', params.context)
  formData.set('folder', params.folder)
  formData.set('overwrite', params.overwrite)
  formData.set('public_id', params.public_id)
  formData.set('tags', params.tags)
  formData.set('timestamp', String(params.timestamp))
  formData.set('signature', cloudinarySignature(params, apiSecret))

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: 'POST',
    body: formData,
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(`Cloudinary upload failed for ${publicId}: HTTP ${response.status} ${JSON.stringify(body)}`)
  }
  return body
}

async function verifyAsset(url) {
  const response = await fetch(url, { method: 'HEAD' })
  if (!response.ok) throw new Error(`Uploaded asset did not verify: ${url} returned HTTP ${response.status}`)
}

async function main() {
  loadEnv()
  const results = {}

  for (const asset of IMAGE_ASSETS) {
    console.log(`Syncing image: ${asset.key}`)
    const { buffer, contentType } = await fetchBuffer(asset.url)
    const result = await uploadAsset({
      buffer,
      contentType,
      fileName: `${asset.publicId}.${contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'}`,
      publicId: asset.publicId,
      resourceType: 'image',
    })
    await verifyAsset(result.secure_url)
    results[asset.key] = {
      url: result.secure_url,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resourceType: result.resource_type,
    }
  }

  for (const asset of VIDEO_ASSETS) {
    console.log(`Syncing video: ${asset.key}`)
    const buffer = await downloadMuxVideo(asset.playbackId)
    const result = await uploadAsset({
      buffer,
      contentType: 'video/mp2t',
      fileName: `${asset.publicId}.ts`,
      publicId: asset.publicId,
      resourceType: 'video',
    })
    const mp4Url = result.secure_url
      .replace('/video/upload/', '/video/upload/f_mp4,q_auto/')
      .replace(/\.[^.]+$/, '.mp4')
    const posterUrl = result.secure_url
      .replace('/video/upload/', '/video/upload/f_jpg,so_0,q_auto,w_1600/')
      .replace(/\.[^.]+$/, '.jpg')
    await verifyAsset(mp4Url)
    await verifyAsset(posterUrl)
    results[asset.key] = {
      url: mp4Url,
      poster: posterUrl,
      bytes: result.bytes,
      duration: result.duration,
      resourceType: result.resource_type,
    }
  }

  mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  writeFileSync(
    REPORT_PATH,
    `${JSON.stringify(
      {
        syncedAt: new Date().toISOString(),
        cloudinaryFolder: CLOUDINARY_FOLDER,
        results,
      },
      null,
      2,
    )}\n`,
  )
  console.log(`Saved verified media map to ${REPORT_PATH}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
