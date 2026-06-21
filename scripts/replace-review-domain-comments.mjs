import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const REVIEW_DOMAIN_PATTERN = /\b(?:https?:\/\/)?(?:www\.)?cmfbynothing\.pk(?:\/[^\s<)]*)?/gi
const REPLACEMENT_NAME = 'Nothing Pakistan'
const PAGE_SIZE = 1000

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return

  const source = fs.readFileSync(filePath, 'utf8')

  for (const line of source.split(/\r?\n/)) {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) continue

    const separatorIndex = trimmedLine.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmedLine.slice(0, separatorIndex).trim()
    let value = trimmedLine.slice(separatorIndex + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function cleanReviewComment(comment) {
  if (!comment || !REVIEW_DOMAIN_PATTERN.test(comment)) {
    REVIEW_DOMAIN_PATTERN.lastIndex = 0
    return comment
  }

  REVIEW_DOMAIN_PATTERN.lastIndex = 0

  return comment
    .replace(REVIEW_DOMAIN_PATTERN, REPLACEMENT_NAME)
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function containsReviewDomain(comment) {
  REVIEW_DOMAIN_PATTERN.lastIndex = 0
  const hasMatch = REVIEW_DOMAIN_PATTERN.test(comment ?? '')
  REVIEW_DOMAIN_PATTERN.lastIndex = 0

  return hasMatch
}

async function fetchAllReviews(supabase) {
  const reviews = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, comment')
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      throw new Error(`Unable to read reviews: ${error.message}`)
    }

    reviews.push(...(data ?? []))

    if (!data || data.length < PAGE_SIZE) {
      break
    }
  }

  return reviews
}

loadDotEnvFile(path.join(projectRoot, '.env.local'))

const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const reviews = await fetchAllReviews(supabase)
const updates = reviews
  .map((review) => ({
    id: review.id,
    previousComment: review.comment,
    nextComment: cleanReviewComment(review.comment),
  }))
  .filter((review) => review.nextComment !== review.previousComment)

for (const review of updates) {
  const { error } = await supabase
    .from('reviews')
    .update({
      comment: review.nextComment,
      updated_at: new Date().toISOString(),
    })
    .eq('id', review.id)

  if (error) {
    throw new Error(`Unable to update review ${review.id}: ${error.message}`)
  }
}

const refreshedReviews = await fetchAllReviews(supabase)
const remainingMatches = refreshedReviews.filter((review) => containsReviewDomain(review.comment))

console.log(
  JSON.stringify(
    {
      scanned: reviews.length,
      updated: updates.length,
      remainingMatches: remainingMatches.length,
      updatedReviewIds: updates.map((review) => review.id),
    },
    null,
    2,
  ),
)
