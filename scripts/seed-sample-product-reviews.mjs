import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const projectRoot = process.cwd()
const sampleSuffix = ' (Sample review)'

const reviewerNames = [
  'Ali Raza',
  'Ayesha Khan',
  'Bilal Ahmed',
  'Danish Iqbal',
  'Fatima Noor',
  'Hamza Siddiqui',
  'Hira Malik',
  'Imran Shah',
  'Mahnoor Ali',
  'Mariam Aslam',
  'Muhammad Usman',
  'Noor Fatima',
  'Rida Hassan',
  'Saad Qureshi',
  'Sana Javed',
  'Shahzaib Khan',
  'Talha Mahmood',
  'Umer Farooq',
  'Ahmed Hassan',
  'Amna Tariq',
  'Arsalan Butt',
  'Eman Zahid',
  'Farhan Akram',
  'Iqra Khalid',
  'Mehwish Raza',
  'Noman Ashraf',
  'Rabia Saleem',
  'Waleed Aslam',
  'Zainab Ahmed',
  'Zoya Sheikh',
]

const cities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar']
const ratingPattern = [5, 5, 4, 5, 5, 4, 5, 3, 5, 5, 4, 5, 2, 5, 5, 4, 5, 1, 5, 5, 4]

function loadEnv() {
  for (const envFile of ['.env.local', 'env']) {
    const fullPath = path.join(projectRoot, envFile)
    if (!existsSync(fullPath)) continue

    for (const line of readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue

      const separatorIndex = trimmed.indexOf('=')
      const key = trimmed.slice(0, separatorIndex).trim()
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '')
      process.env[key] ||= value
    }
  }
}

function hash(value) {
  let output = 2166136261
  for (const character of value) {
    output ^= character.charCodeAt(0)
    output = Math.imul(output, 16777619)
  }
  return output >>> 0
}

function classify(entry) {
  const text = `${entry.name} ${entry.slug} ${entry.product_type ?? ''}`.toLowerCase()
  if (entry.related_type === 'mobile') return 'phone'
  if (/(buds|ear|headphone|neckband)/.test(text)) return 'audio'
  if (/(watch)/.test(text)) return 'watch'
  if (/(charger|power|gan|cable)/.test(text)) return 'charging'
  if (/(protector|privacy|sheet|glass)/.test(text)) return 'protector'
  if (/(cover|case)/.test(text)) return 'cover'
  return 'product'
}

function reviewTitle(kind, rating, index) {
  const romanUrduTitles = {
    phone: ['Daily use mein smooth', 'Camera aur battery achi lagi', 'Design bohat clean hai'],
    audio: ['Sound clear hai', 'Calls aur battery dono achay', 'Daily listening ke liye comfortable'],
    watch: ['Roz ke use ke liye useful', 'Display aur battery achi hai', 'Fitness tracking kaam ki hai'],
    charging: ['Charging fast aur stable hai', 'Build quality solid lagi', 'Rozana use ka acha accessory'],
    protector: ['Screen par fit clean hai', 'Touch response bilkul theek', 'Daily scratches se achi protection'],
    cover: ['Phone par fit perfect hai', 'Grip aur look dono achay', 'Buttons asani se press hotay hain'],
    product: ['Quality achi lagi', 'Purchase se satisfied hoon', 'Daily use mein kaam ki cheez'],
  }
  const positive = {
    phone: ['Excellent daily phone', 'Camera and display are impressive', 'Smooth Nothing OS experience', 'Very happy with the phone'],
    audio: ['Amazing sound quality', 'Clear calls and strong battery', 'Comfortable for daily listening', 'ANC works really well'],
    watch: ['Useful everyday smartwatch', 'Display looks great', 'Battery timing is impressive', 'Good fitness companion'],
    charging: ['Fast and reliable charging', 'Solid build quality', 'Very useful daily accessory', 'Works well with my devices'],
    protector: ['Clean fit on the screen', 'Good protection for daily use', 'Touch response stays smooth', 'Worth it for screen safety'],
    cover: ['Fits the phone perfectly', 'Good grip and clean look', 'Buttons and ports stay accessible', 'Nice everyday protection'],
    product: ['Good quality product', 'Happy with the purchase', 'Useful for daily use', 'Exactly what I needed'],
  }

  if (rating >= 4 && index % 6 === 2) return romanUrduTitles[kind][index % romanUrduTitles[kind].length]
  if (rating === 5) return positive[kind][index % positive[kind].length]
  if (rating === 4) return 'Good product with minor room for improvement'
  if (rating === 3) return 'Decent overall experience'
  if (rating === 2) return 'Useful, but the experience could be better'
  return 'Did not fully meet my expectations'
}

function reviewBody(entry, kind, rating, city, index) {
  const englishExperiences = {
    phone: [
      `${entry.name} has stayed responsive with calls, maps, camera use and social apps. The display is easy to read outdoors, and the battery comfortably gets me through my normal day.`,
      `I moved my SIM and apps over without trouble. Nothing OS feels uncluttered, notifications are easy to manage, and the phone has not slowed down in my regular use.`,
      `The design was the main reason I chose it, but the camera and battery have been the useful parts day to day. Photos look natural and charging has been predictable.`,
      `After using the phone for work calls and evening photos, the experience feels balanced. It is quick, comfortable to hold, and the screen looks sharp.`,
    ],
    audio: [
      `${entry.name} paired quickly with my phone and has stayed connected on calls and walks. Vocals are clear, bass is present without covering everything else, and the fit works for longer sessions.`,
      `I mostly use these for office calls and podcasts. The microphones have been clear, the controls are easy to learn, and I only need to charge the case every few days.`,
      `Noise cancellation takes the edge off traffic and fan noise. Music still sounds detailed at lower volume, which is what I wanted for daily listening.`,
      `The earbuds sit securely without feeling heavy. Switching between music and calls is quick, and I have not had noticeable connection drops.`,
    ],
    watch: [
      `${entry.name} gives me the notifications and activity basics I actually use. The display is bright, the menus are straightforward, and the battery does not need daily charging.`,
      `Calls and message alerts have worked reliably during my routine. The watch is light on the wrist and sleep tracking has been useful for spotting patterns.`,
      `I wanted a simple fitness watch rather than something complicated. Step tracking, workouts and heart-rate readings are easy to find and the screen responds quickly.`,
      `The design looks clean with both casual and work clothes. Battery life has been consistent and the companion app was easy to set up.`,
    ],
    charging: [
      `${entry.name} has charged my compatible devices at the expected speed without disconnecting. The cable and ports feel firm, and normal warmth has stayed within what I would expect.`,
      `I keep this in my work bag and use it almost every day. It is compact, feels solid, and has been reliable with the devices listed as compatible.`,
      `The charger does the basic job properly: stable connection, useful speed and no unusual heating in my routine. Delivery to ${city} was straightforward.`,
      `Build quality feels better than the generic charger I replaced. It plugs in securely and has handled repeated daily use without becoming loose.`,
    ],
    protector: [
      `${entry.name} lines up well with the matching phone and does not interfere with the case. The display remains clear and touch response feels the same as before.`,
      `Installation took a few careful minutes, but the edges settled cleanly. Finger swipes and the keyboard still respond normally.`,
      `The protector covers the useful screen area without looking bulky. It has already prevented a few small bag scratches and is easy to wipe clean.`,
      `Fit around the speaker and edges is accurate. I would recommend cleaning the screen carefully first, because the final result is much better without dust underneath.`,
    ],
    cover: [
      `${entry.name} fits the phone closely and adds grip without hiding the design. The camera opening is aligned and the side buttons still have a clear click.`,
      `The case feels comfortable in one hand and gives the corners useful protection. It has not made the phone feel unnecessarily thick.`,
      `Fit is accurate for the listed model, including the charging port and speakers. It has been practical for everyday use around ${city}.`,
      `I like that the cover stays simple and does not add much weight. The raised edge gives the screen and camera a little more protection on a desk.`,
    ],
    product: [
      `${entry.name} matched the photos and description, arrived safely, and has been straightforward to use. The finish feels tidy and nothing was missing from the package.`,
      `I had one compatibility question before ordering and support answered it clearly. The product has worked as expected in my regular setup.`,
      `Delivery to ${city} was smooth and the packaging protected the item well. After setup, the product did the job I bought it for without extra fuss.`,
      `The controls and setup were easy to understand. Build quality feels appropriate for the price and it has been reliable in everyday use.`,
    ],
  }
  const romanUrduExperiences = {
    phone: [
      `${entry.name} daily use mein smooth chal raha hai. Camera natural photos leta hai, screen bright hai aur meri normal calls aur apps ke sath battery araam se din nikal deti hai.`,
      `Setup asaan tha aur Nothing OS clean lagta hai. Notifications aur apps manage karna simple hai, aur abhi tak performance mein koi rukawat mehsoos nahi hui.`,
    ],
    audio: [
      `${entry.name} ka sound clear hai aur bass balanced lagti hai. Calls mein awaaz samajh aati hai, pairing jaldi hoti hai aur fit lambi listening mein bhi comfortable raha.`,
      `Office calls aur music dono ke liye use kiya. Connection stable raha, controls samajhna asaan tha aur battery meri routine ke liye kaafi hai.`,
    ],
    watch: [
      `${entry.name} rozana notifications aur steps dekhne ke liye useful hai. Display saaf nazar aata hai, watch halka hai aur battery har roz charge nahi karni parti.`,
      `Setup jaldi ho gaya aur app simple hai. Calls, activity tracking aur sleep data meri zaroorat ke hisaab se theek kaam kar rahe hain.`,
    ],
    charging: [
      `${entry.name} compatible device ko stable speed se charge karta hai. Plug aur cable solid feel hotay hain aur normal use mein koi unusual heating nahi hui.`,
      `Roz bag mein le kar jata hoon. Size convenient hai, connection loose nahi hota aur charging ab tak reliable rahi hai.`,
    ],
    protector: [
      `${entry.name} screen par clean fit hua aur touch response bilkul theek hai. Install karte waqt thori care chahiye, lekin edges achay se settle ho gaye.`,
      `Display clear rehti hai aur case ke sath bhi protector lift nahi hua. Daily scratches se bachane ke liye acha option laga.`,
    ],
    cover: [
      `${entry.name} phone par theek fit hota hai aur grip pehle se behtar ho gayi. Buttons press karna asaan hai aur ports cover nahi hotay.`,
      `Cover zyada bulky nahi lagta, corners ko protection milti hai aur camera cutout bhi sahi align hai. Daily use mein practical hai.`,
    ],
    product: [
      `${entry.name} listing ke mutabiq mila aur packing safe thi. Setup simple tha, quality theek lagi aur product meri daily zaroorat poori kar raha hai.`,
      `Order se pehle compatibility confirm ki thi aur support ne clear jawab diya. Item sahi mila aur ab tak expected tarah kaam kar raha hai.`,
    ],
  }

  const mentionsStore = index % 4 === 0
  const storeLead = mentionsStore ? `Ordered from cmfbynothing.pk for delivery in ${city}.` : ''
  const durationNotes = [
    'I wrote this after a full week of regular use.',
    'These are my notes after using it through several workdays.',
    'I tested the main features before leaving this feedback.',
    'This has been part of my normal routine for more than a few days.',
  ]
  const joinParts = (...parts) => parts.filter(Boolean).join(' ')

  if (rating >= 4) {
    const experience =
      index % 5 === 1
        ? romanUrduExperiences[kind][index % romanUrduExperiences[kind].length]
        : englishExperiences[kind][index % englishExperiences[kind].length]
    return joinParts(storeLead, experience, durationNotes[index % durationNotes.length])
  }

  if (rating === 3) {
    return joinParts(
      storeLead,
      `${entry.name} works as described and the main features are useful. The overall experience is decent, although I expected a little more polish for the price.`,
      index % 2 === 0 ? 'Daily use theek hai, lekin value thori behtar ho sakti thi.' : durationNotes[index % durationNotes.length],
    )
  }

  if (rating === 2) {
    return joinParts(
      storeLead,
      `${entry.name} is usable, but my experience was mixed. The product does the basic job, though fit, finish, or performance could be improved.`,
      'Order process theek tha, lekin product experience mein behtari ki gunjaish hai.',
    )
  }

  return joinParts(
    storeLead,
    `${entry.name} did not fully match my expectations. I recommend confirming compatibility and product details carefully before ordering.`,
    'Support response was clear, but the product itself was not the right fit for my use.',
  )
}

function reviewDate(seed, index) {
  const base = Date.UTC(2026, 5, 4, 12, 0, 0)
  const daysAgo = 2 + ((seed + index * 11) % 210)
  return new Date(base - daysAgo * 24 * 60 * 60 * 1000).toISOString()
}

function uniqueReviewDetail(sequence) {
  const settings = [
    'during my weekday routine',
    'while working from home',
    'during regular daily travel',
    'with my usual device setup',
    'during longer use sessions',
    'throughout a busy week',
    'while handling everyday tasks',
    'during my evening routine',
  ]
  const focus = [
    'reliability was the main thing I noticed',
    'ease of use stood out most',
    'build quality was important to me',
    'daily convenience mattered most',
    'performance stayed my main focus',
    'comfort and usability mattered most',
    'the overall experience felt consistent',
    'practical everyday use was my priority',
  ]

  return `I also tested it ${settings[sequence % settings.length]}, where ${focus[Math.floor(sequence / settings.length) % focus.length]}.`
}

async function run() {
  loadEnv()

  const apply = process.argv.includes('--apply')
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const [{ data: products, error: productsError }, { data: mobiles, error: mobilesError }] = await Promise.all([
    supabase.from('products').select('id,name,slug,product_type').order('id'),
    supabase.from('mobiles').select('id,name,slug').order('id'),
  ])

  if (productsError) throw productsError
  if (mobilesError) throw mobilesError

  const entries = [
    ...(products ?? []).map((entry) => ({ ...entry, related_type: 'product' })),
    ...(mobiles ?? []).map((entry) => ({ ...entry, product_type: null, related_type: 'mobile' })),
  ]

  const rows = []
  const counts = []
  const usedComments = new Set()

  for (const entry of entries) {
    const seed = hash(`${entry.related_type}:${entry.id}:${entry.slug}`)
    const count = 4 + (seed % 7)
    const kind = classify(entry)
    counts.push({ relatedType: entry.related_type, relatedId: entry.id, slug: entry.slug, count })

    for (let index = 0; index < count; index += 1) {
      const rating = ratingPattern[(seed + index) % ratingPattern.length]
      const reviewerName = reviewerNames[(seed + index * 7) % reviewerNames.length]
      const city = cities[(seed + index * 5) % cities.length]
      const createdAt = reviewDate(seed, index)
      const title = reviewTitle(kind, rating, index)
      const body = reviewBody(entry, kind, rating, city, index)
      let comment = `${title}\n${body}`
      let uniquenessSequence = rows.length

      while (usedComments.has(comment)) {
        comment = `${title}\n${body} ${uniqueReviewDetail(uniquenessSequence)}`
        uniquenessSequence += 1
      }

      usedComments.add(comment)

      rows.push({
        related_type: entry.related_type,
        related_id: entry.id,
        user_name: `${reviewerName}${sampleSuffix}`,
        rating,
        comment,
        created_at: createdAt,
        updated_at: createdAt,
      })
    }
  }

  if (apply) {
    const { error: deleteError } = await supabase.from('reviews').delete().like('user_name', `%${sampleSuffix}`)
    if (deleteError) throw deleteError

    for (let index = 0; index < rows.length; index += 250) {
      const { error } = await supabase.from('reviews').insert(rows.slice(index, index + 250))
      if (error) throw error
    }
  }

  const ratingCounts = Object.fromEntries(
    [1, 2, 3, 4, 5].map((rating) => [rating, rows.filter((row) => row.rating === rating).length]),
  )
  const storeMentions = rows.filter((row) => row.comment.includes('cmfbynothing.pk')).length
  const romanUrduReviews = rows.filter((row) =>
    /(daily use mein|Setup asaan tha|sound clear hai|rozana notifications|stable speed se charge|screen par clean fit|phone par theek fit|listing ke mutabiq|Order process theek tha)/.test(
      row.comment,
    ),
  ).length

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    entities: entries.length,
    reviews: rows.length,
    minimumReviews: Math.min(...counts.map((item) => item.count)),
    maximumReviews: Math.max(...counts.map((item) => item.count)),
    ratingCounts,
    storeMentions,
    romanUrduReviews,
    duplicateFullReviews: rows.length - usedComments.size,
  }, null, 2))
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
