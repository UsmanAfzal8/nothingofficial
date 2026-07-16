import type { ImageLoaderProps } from 'next/image'

const CLOUDINARY_HOSTNAME = 'res.cloudinary.com'
const TRANSFORMATION_PATTERN = /(?:^|,)(?:a_|ar_|b_|bo_|c_|co_|d_|dn_|dpr_|e_|f_|fl_|fn_|g_|h_|l_|o_|q_|r_|t_|u_|w_|x_|y_|z_)/

type CloudinaryImageOptions = {
  width?: number
}

export function buildCloudinaryImageUrl(src: string, options: CloudinaryImageOptions = {}): string {
  if (!src.startsWith('https://')) return src

  try {
    const url = new URL(src)
    if (url.hostname !== CLOUDINARY_HOSTNAME || !url.pathname.includes('/image/upload/')) {
      return src
    }

    const [prefix, uploadPath] = url.pathname.split('/image/upload/')
    if (!uploadPath) return src

    const segments = uploadPath.split('/').filter(Boolean)
    while (segments.length > 0 && TRANSFORMATION_PATTERN.test(segments[0])) {
      segments.shift()
    }

    const width = options.width && Number.isFinite(options.width)
      ? Math.max(64, Math.round(options.width))
      : null
    const transformation = ['f_auto', 'q_auto', width ? `w_${width}` : null, width ? 'c_limit' : null]
      .filter(Boolean)
      .join(',')

    url.pathname = `${prefix}/image/upload/${transformation}/${segments.join('/')}`
    return url.toString()
  } catch {
    return src
  }
}

export default function cloudinaryImageLoader({ src, width }: ImageLoaderProps): string {
  return buildCloudinaryImageUrl(src, { width })
}

export function buildCloudinaryVideoUrl(src: string): string {
  if (!src.startsWith('https://') || /\.m3u8(?:$|\?)/i.test(src)) return src

  try {
    const url = new URL(src)
    if (url.hostname !== CLOUDINARY_HOSTNAME || !url.pathname.includes('/video/upload/')) {
      return src
    }

    const [prefix, uploadPath] = url.pathname.split('/video/upload/')
    if (!uploadPath) return src

    const segments = uploadPath.split('/').filter(Boolean)
    while (segments.length > 0 && TRANSFORMATION_PATTERN.test(segments[0])) {
      segments.shift()
    }

    url.pathname = `${prefix}/video/upload/f_auto,q_auto,vc_auto/${segments.join('/')}`
    return url.toString()
  } catch {
    return src
  }
}
