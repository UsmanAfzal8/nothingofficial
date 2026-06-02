import { NextResponse } from 'next/server'
import type { ProductFeatureSection } from '@/lib/models/product-detail'
import type {
  SupabaseMobileRow,
  SupabaseProductFeatureSectionRow,
  SupabaseProductFeatureSlideRow,
  SupabaseProductRow,
} from '@/lib/models/supabase-store'
import { getSupabaseAdminClient } from '@/lib/supabase-admin'
import { toSeoHandle } from '@/lib/utils/seo'

const NO_INDEX_HEADERS = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
}

type RouteContext = {
  params: {
    handle: string
    sectionId: string
  }
}

type ProductLookup =
  | {
      relatedType: 'product'
      relatedId: number
    }
  | {
      relatedType: 'mobile'
      relatedId: number
    }

function jsonNoIndex(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...NO_INDEX_HEADERS,
      ...(init?.headers ?? {}),
    },
  })
}

function parseSectionId(sectionId: string) {
  const numericId = sectionId.replace(/^product-feature-section-/, '')
  const parsedId = Number(numericId)

  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null
}

async function resolveProductLookup(handle: string): Promise<ProductLookup | null> {
  const supabase = getSupabaseAdminClient()

  if (!supabase) return null

  const [{ data: product, error: productError }, { data: mobile, error: mobileError }] = await Promise.all([
    supabase.from('products').select('id, slug').eq('slug', handle).maybeSingle(),
    supabase.from('mobiles').select('id, slug').eq('slug', handle).maybeSingle(),
  ])

  if (productError || mobileError) {
    return null
  }

  if (product) {
    return {
      relatedType: 'product',
      relatedId: (product as Pick<SupabaseProductRow, 'id'>).id,
    }
  }

  if (mobile) {
    return {
      relatedType: 'mobile',
      relatedId: (mobile as Pick<SupabaseMobileRow, 'id'>).id,
    }
  }

  return null
}

function mapFeatureSection(section: SupabaseProductFeatureSectionRow, slides: SupabaseProductFeatureSlideRow[]): ProductFeatureSection {
  return {
    id: `product-feature-section-${section.id}`,
    sourceKey: section.source_key,
    featureKey: section.feature_key,
    featureTitle: section.feature_title,
    featureVersion: section.feature_version,
    title: section.title,
    displayContext: section.display_context,
    coverImageUrl: section.cover_image_url,
    coverVideoPlaybackId: section.cover_video_playback_id,
    coverVideoUrl: section.cover_video_url,
    coverThumbnailUrl: section.cover_thumbnail_url,
    sortOrder: section.sort_order,
    slides: slides.map((slide) => ({
      id: `product-feature-slide-${slide.id}`,
      sourceKey: slide.source_key,
      title: slide.title,
      body: slide.body,
      mediaType: slide.media_type,
      imageUrl: slide.image_url,
      videoPlaybackId: slide.video_playback_id,
      videoUrl: slide.video_url,
      thumbnailUrl: slide.thumbnail_url,
      sortOrder: slide.sort_order,
    })),
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(_request: Request, { params }: RouteContext) {
  const supabase = getSupabaseAdminClient()

  if (!supabase) {
    return jsonNoIndex({ error: 'Supabase is not configured.' }, { status: 500 })
  }

  const lookup = await resolveProductLookup(toSeoHandle(params.handle))
  const sectionId = parseSectionId(params.sectionId)

  if (!lookup) {
    return jsonNoIndex({ error: 'Product not found.' }, { status: 404 })
  }

  if (!sectionId) {
    return jsonNoIndex({ error: 'Invalid feature section.' }, { status: 400 })
  }

  const { data: section, error: sectionError } = await supabase
    .from('product_feature_sections')
    .select('id, related_type, related_id, source_key, feature_key, feature_title, feature_version, title, display_context, cover_image_url, cover_video_playback_id, cover_video_url, cover_thumbnail_url, sort_order, active, created_at, updated_at')
    .eq('id', sectionId)
    .eq('related_type', lookup.relatedType)
    .eq('related_id', lookup.relatedId)
    .eq('active', true)
    .maybeSingle()

  if (sectionError) {
    return jsonNoIndex({ error: sectionError.message }, { status: 500 })
  }

  if (!section) {
    return jsonNoIndex({ error: 'Feature section not found.' }, { status: 404 })
  }

  const { data: slides, error: slidesError } = await supabase
    .from('product_feature_slides')
    .select('id, product_feature_section_id, source_key, title, body, media_type, image_url, video_playback_id, video_url, thumbnail_url, sort_order, active, created_at, updated_at')
    .eq('product_feature_section_id', sectionId)
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (slidesError) {
    return jsonNoIndex({ error: slidesError.message }, { status: 500 })
  }

  return jsonNoIndex({
    section: mapFeatureSection(
      section as SupabaseProductFeatureSectionRow,
      (slides ?? []) as SupabaseProductFeatureSlideRow[],
    ),
  })
}
