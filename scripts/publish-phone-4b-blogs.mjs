import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ROOT = process.cwd()
const SITE_URL = 'https://www.nothingpakistan.pk'
const BRAND = 'Nothing Pakistan'
const UPDATED_LABEL = 'June 28, 2026'
const HERO_IMAGE =
  'https://res.cloudinary.com/dklsubnzb/image/upload/v1782595462/nothing-official-store-pakistan/home/phone-4b-launch/nothing-phone-4b-blue-homepage.jpg'
const REPORT_PATH = path.join(ROOT, 'tmp', 'phone-4b-blog-publish-report.json')

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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function stripHtml(value) {
  return String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function wordCount(value) {
  return stripHtml(value).split(/\s+/).filter(Boolean).length
}

function p(value) {
  return ['  <p>', `    ${value}`, '  </p>'].join('\n')
}

function h2(value) {
  return `  <h2>${escapeHtml(value)}</h2>`
}

function section(title, paragraphs) {
  return ['<section>', h2(title), ...paragraphs.map((paragraph) => p(paragraph)), '</section>'].join('\n')
}

function list(items) {
  return ['  <ul>', ...items.map((item) => `    <li>${item}</li>`), '  </ul>'].join('\n')
}

function table(rows) {
  return [
    '  <table>',
    '    <thead>',
    '      <tr><th>Detail</th><th>Status before launch</th><th>What buyers should do</th></tr>',
    '    </thead>',
    '    <tbody>',
    ...rows.map(([label, status, action]) => `      <tr><td>${label}</td><td>${status}</td><td>${action}</td></tr>`),
    '    </tbody>',
    '  </table>',
  ].join('\n')
}

const CONFIRMED_TABLE = [
  ['Product name', 'Nothing Phone (4b) is confirmed', 'Use the exact name when following updates or asking a seller'],
  ['Reveal date', '7 July 2026 at 11:00 BST', 'Watch at 3:00 PM Pakistan Standard Time'],
  ['Official colour shown', 'Blue', 'Wait for launch confirmation before assuming other colours'],
  ['Rear camera layout', 'Two vertically arranged lenses', 'Wait for sensor and stabilization details'],
  ['Rear lighting', 'A compact Glyph-style light bar is visible', 'Wait for supported functions and lighting zones'],
  ['Pakistan price', 'Not announced', 'Treat pre-launch amounts as estimates, not official prices'],
  ['PTA status', 'Not confirmed', 'Verify the exact IMEI and listing status before payment'],
]

const ARTICLES = [
  {
    title: 'Nothing Phone 4b Launch Date in Pakistan: July 7 Reveal Guide',
    slug: 'nothing-phone-4b-launch-date-pakistan-july-7-reveal-guide',
    category: 'News',
    contentType: 'news',
    focusKeyword: 'Nothing Phone 4b launch date in Pakistan',
    metaDescription:
      'Nothing Phone (4b) launches on 7 July 2026 at 3 PM Pakistan time. See the confirmed schedule, design, expected announcements, reminder link, and 20 FAQs.',
    excerpt:
      'Nothing will reveal Phone (4b) on 7 July 2026 at 3:00 PM Pakistan time. This guide explains what is confirmed, what the launch should answer, and how Pakistan buyers can prepare.',
    quickAnswer:
      'The Nothing Phone (4b) reveal is scheduled for Tuesday, 7 July 2026 at 11:00 BST, which is 3:00 PM in Pakistan. The phone name and blue exterior design are official, while price, specifications, PTA status, and Pakistan availability are still awaiting confirmation.',
    pakistanLens:
      'global announcement time is only the first step; local price, PTA position, warranty handling, and stock timing decide whether the phone is actually ready to buy',
    verdict:
      'Set a reminder for 3:00 PM PKT, watch for the complete specification sheet, and avoid paying against a pre-launch listing that cannot explain the variant, PTA status, warranty, and delivery date.',
    intro: [
      'Nothing has turned the Phone (4b) into one of the more interesting affordable-phone launches of 2026 by revealing the name and design before explaining the hardware. That creates excitement, but it also creates a week in which rumours can look more certain than they really are.',
      'For Pakistan buyers, the useful question is not simply “when does it launch?” It is what the launch will confirm, how quickly a regional variant may reach Pakistan, and which details must be checked before a local price can be trusted.',
      `This guide is updated by ${BRAND} for readers who want the announcement in Pakistan time, a clear launch-day checklist, and a practical path to follow at <a href="/nothing-phone-4b-pakistan">the Phone (4b) Pakistan page</a>.`,
    ],
    points: [
      {
        title: 'The official launch time in Pakistan',
        lead: 'Nothing has scheduled the reveal for 11:00 BST on 7 July 2026. British Summer Time is four hours behind Pakistan Standard Time in July, so the presentation begins at 3:00 PM PKT.',
        impact: 'That afternoon timing is convenient for local viewers and gives retailers the rest of the day to update international listings, but Pakistan stock pages may not appear at the same moment as the global broadcast.',
        verification: 'Check the date and time against the official launch notice and the countdown shown on the Nothing homepage rather than relying on reposted graphics with another country’s time zone.',
        caution: 'do not confuse a global reveal with a confirmed Pakistan sale date',
      },
      {
        title: 'What Nothing has already confirmed',
        lead: 'The product name, launch date, blue colour shown in campaign material, dual rear-camera layout, centered front camera cutout, flat display outline, and compact rear light bar are visible in official material.',
        impact: 'Those details are enough to discuss the design direction, but they do not reveal image quality, display quality, performance, charging, storage, durability, or software support.',
        verification: 'Official images are the strongest source for visible hardware. They cannot confirm a sensor model, battery number, or chipset unless Nothing states those details separately.',
        caution: 'treat conclusions drawn from appearance as observations, not specifications',
      },
      {
        title: 'What the July 7 presentation must answer',
        lead: 'The main unanswered questions are the chipset, display resolution and brightness, rear camera sensors, front camera, battery capacity, charging speed, RAM, storage, software version, update promise, protection rating, and pricing.',
        impact: 'Each item changes the value calculation. A lower price can justify simpler cameras, while a stronger update policy or larger battery can matter more than benchmark scores for many buyers.',
        verification: 'Save the official specification page after the presentation and compare it with the exact regional model number shown by a Pakistan seller.',
        caution: 'wait for the complete specification sheet before calling the phone a bargain or a disappointment',
      },
      {
        title: 'Why Phone (4b) exists in the 2026 lineup',
        lead: 'The new b-series name suggests a model below the a-series. Its arrival also follows Nothing’s statement that a new CMF phone would not be released in 2026 because cost pressure made a meaningful affordable successor difficult.',
        impact: 'Phone (4b) may give Nothing a clearer entry point without presenting the device as a direct CMF continuation. That distinction matters for design, software positioning, accessories, and buyer expectations.',
        verification: 'The launch should explain the b-series role in Nothing’s own words. Until then, descriptions such as “CMF replacement” or “Phone (4a) Lite” remain interpretations.',
        caution: 'do not assume product hierarchy from one letter alone',
      },
      {
        title: 'How quickly Pakistan availability may follow',
        lead: 'A global or India launch does not guarantee same-day Pakistan stock. Import planning, regional variants, customs movement, seller allocation, warranty arrangements, and PTA handling all affect local timing.',
        impact: 'Early units can command a premium and may arrive with unclear support. Waiting for stable stock often produces better variant choice and more reliable price comparison.',
        verification: 'A credible local listing should name the storage, colour, model number, PTA status, warranty source, delivery estimate, and return process.',
        caution: 'avoid treating “coming soon” as proof that stock is already secured',
      },
      {
        title: 'How to use the WhatsApp reminder',
        lead: 'The Remind Me button on Nothing Pakistan opens WhatsApp with a prepared request asking to be informed when Phone (4b) becomes available.',
        impact: 'A reminder is useful because it records buyer interest without pretending a pre-order exists before price, stock, and delivery terms are confirmed.',
        verification: 'The message should open a conversation with the published Nothing Pakistan number, +92 342 4476070, and should not ask for advance payment.',
        caution: 'a reminder is an information request, not a reservation or confirmed order',
      },
      {
        title: 'What to record during the announcement',
        lead: 'Write down the official model variants, starting price, launch markets, sale date, box contents, charger support, software policy, and any region-specific differences mentioned on screen.',
        impact: 'These notes make it easier to spot local listings that mix a global specification with a different regional variant or compare prices without including PTA and accessories.',
        verification: 'Use the final product page and support documentation after the event because launch slides often summarize features without every condition or footnote.',
        caution: 'do not base a purchase on one headline number taken out of context',
      },
      {
        title: 'What not to buy before launch',
        lead: 'A seller may advertise a Phone (4b) before having final allocation, a confirmed price, or even a verified regional model. That is common around high-interest launches.',
        impact: 'Advance payment creates risk when delivery timing, refund rules, PTA status, and warranty are still vague. A small discount is not worth an open-ended commitment.',
        verification: 'Ask for a written invoice or pre-order agreement that states the exact variant, refundable amount, expected dispatch date, cancellation rule, and seller identity.',
        caution: 'walk away when urgency replaces clear terms',
      },
      {
        title: 'Launch-day comparison with Phone (4a)',
        lead: 'Phone (4a) is already a known reference with a 120 Hz AMOLED display, Snapdragon 7s Gen 4 platform, 5,080 mAh global battery, 50 W charging, and a three-camera system including periscope zoom.',
        impact: 'Phone (4b) does not need to match every Phone (4a) feature if it costs meaningfully less, but the missing features must be understood rather than discovered after purchase.',
        verification: 'Compare official specifications side by side and calculate the final Pakistan ownership cost for the same storage and PTA category.',
        caution: 'do not compare a rumoured Phone (4b) price with a real Phone (4a) specification list',
      },
      {
        title: 'The first 24 hours after the reveal',
        lead: 'Initial coverage will move quickly, and some articles will repeat old leaks even after the official facts are available. Product pages may also change as regional stores add local variants.',
        impact: 'A short pause helps buyers separate confirmed facts from launch noise. It also allows Nothing Pakistan to update FAQs, price guidance, and compatibility notes with cleaner information.',
        verification: 'Look for matching details across the official product page, official support pages, and the exact local listing rather than counting how many websites repeat the same claim.',
        caution: 'speed is less valuable than a correct variant and a clear support route',
      },
    ],
    faqs: [
      ['When is the Nothing Phone (4b) launch?', 'Nothing will reveal Phone (4b) on Tuesday, 7 July 2026.'],
      ['What time is the Phone (4b) launch in Pakistan?', 'The event begins at 3:00 PM Pakistan Standard Time, based on the confirmed 11:00 BST schedule.'],
      ['Is Phone (4b) officially confirmed?', 'Yes. Nothing has confirmed the name, reveal date, and exterior design.'],
      ['Will Phone (4b) go on sale on July 7?', 'The reveal date is confirmed, but the Pakistan sale date is not. Nothing may announce market-specific availability during the event.'],
      ['Where can I get a Pakistan reminder?', 'Use the Remind Me button on nothingpakistan.pk to open a WhatsApp availability request.'],
      ['Is the reminder a pre-order?', 'No. It is an information request and does not reserve stock or require payment.'],
      ['What colour has Nothing shown?', 'Nothing has officially shown a blue Phone (4b). Other colours need launch confirmation.'],
      ['How many cameras are visible?', 'The official design shows two rear camera lenses and one centered front camera cutout.'],
      ['Does Phone (4b) have Glyph lights?', 'A compact rear light bar is visible, but its complete functions have not been explained.'],
      ['Will the launch include a Pakistan price?', 'That is not guaranteed. A global or India price may be announced before a Pakistan retail price exists.'],
      ['Can I watch the event from Pakistan?', 'Yes. The online reveal timing is 3:00 PM PKT on 7 July 2026.'],
      ['Should I pay a seller before the launch?', 'Only consider payment when the exact variant, refund terms, delivery date, PTA status, and warranty are written clearly.'],
      ['Will Phone (4b) replace CMF Phone?', 'Nothing has not officially called it a CMF replacement. The launch should clarify its position.'],
      ['Is Phone (4b) cheaper than Phone (4a)?', 'It is expected to sit lower in the range, but official pricing is required for a real comparison.'],
      ['What specifications are confirmed?', 'Visible design details are confirmed. Core hardware specifications are still awaiting the reveal.'],
      ['When will Pakistan stock arrive?', 'No verified date is available yet. Stock timing depends on regional supply and local import arrangements.'],
      ['Will there be multiple storage variants?', 'Leaks suggest more than one variant, but official capacities must be confirmed on launch day.'],
      ['What should I check after the event?', 'Check price, storage, cameras, battery, charging, bands, software support, box contents, PTA status, and warranty.'],
      ['Will Nothing Pakistan update this guide?', 'Yes. Nothing Pakistan will update launch, price, PTA, and availability information when verified.'],
      ['What is the safest launch-day decision?', 'Compare official facts and final local cost before ordering; do not buy from a vague listing simply to be first.'],
    ],
  },
  {
    title: 'Nothing Phone 4b Price in Pakistan: What to Expect Before Launch',
    slug: 'nothing-phone-4b-price-in-pakistan-what-to-expect',
    category: 'Prices',
    contentType: 'guide',
    focusKeyword: 'Nothing Phone 4b price in Pakistan',
    metaDescription:
      'Understand the expected Nothing Phone (4b) price in Pakistan, what affects local cost, PTA and warranty differences, launch pricing risks, and 20 buyer FAQs.',
    excerpt:
      'No official Nothing Phone (4b) price in Pakistan exists before the 7 July reveal. This guide explains how to judge estimates and calculate the real local ownership cost.',
    quickAnswer:
      'Nothing has not announced an official Phone (4b) price for Pakistan. Pre-launch figures should be treated as estimates. A reliable local price can only be judged after the international price, storage variants, regional availability, PTA status, exchange rate, import cost, and warranty route are known.',
    pakistanLens:
      'the sticker price is only useful when the storage, PTA status, warranty, accessories, delivery, and payment terms are the same',
    verdict:
      'Wait for the 7 July price announcement, calculate the final cost for the exact variant, and compare PTA-approved with PTA-approved rather than using a low non-PTA headline as the benchmark.',
    intro: [
      'Price is the most searched Phone (4b) question in Pakistan, and it is also the easiest detail to get wrong before launch. Search pages often publish an “expected price” because a blank space looks less attractive than a number, even when that number has no official source.',
      'A sensible estimate starts after Nothing announces the base price and storage options. It then accounts for currency conversion, taxes, import costs, stock scarcity, PTA registration, seller margin, included accessories, and local warranty.',
      `Nothing Pakistan keeps the current answer simple: the official Pakistan price is not announced. Follow <a href="/nothing-phone-4b-pakistan">the Phone (4b) Pakistan page</a> for verified updates instead of treating an early estimate as a quotation.`,
    ],
    points: [
      {
        title: 'Why there is no official Pakistan price yet',
        lead: 'Phone (4b) has been named and shown, but the complete launch is scheduled for 7 July. Nothing has not published a Pakistan retail amount, local storage list, or local sale date.',
        impact: 'Without those details, two websites can display different prices while both are guessing from different markets or older Nothing models.',
        verification: 'An official local price should be attached to a clear variant and buying route, not only repeated in a specification database.',
        caution: 'label every pre-launch number as an estimate until a verifiable Pakistan listing exists',
      },
      {
        title: 'How international launch price becomes a Pakistan price',
        lead: 'The international figure is converted into rupees, but direct currency conversion is only the first layer. Freight, customs treatment, payment fees, local operations, warranty cover, and stock risk can change the result.',
        impact: 'A phone that appears inexpensive in pounds, euros, or Indian rupees may not land in Pakistan at the same relative value.',
        verification: 'Record the launch currency, tax treatment, storage, and market before comparing it with a local amount.',
        caution: 'do not multiply a foreign price by the exchange rate and call the result the official Pakistan price',
      },
      {
        title: 'PTA-approved and non-PTA prices are different products',
        lead: 'A PTA-approved listing includes local cellular registration for the stated device, while a non-PTA listing may stop using Pakistani mobile networks after the permitted period unless the buyer pays the applicable tax.',
        impact: 'The lower non-PTA headline can look attractive but hide a major later cost. Wi-Fi-only use is not a substitute for normal phone ownership for most buyers.',
        verification: 'Check the IMEI status independently and ask whether the invoice explicitly states PTA approved.',
        caution: 'never compare a non-PTA Phone (4b) with a PTA-approved competitor as if the prices include the same thing',
      },
      {
        title: 'Storage can move the price more than expected',
        lead: 'Leaks have discussed 8 GB RAM with 128 GB or 256 GB storage, but Nothing has not confirmed the final variants. The local market may also receive only part of the global range.',
        impact: 'A 256 GB phone is not directly comparable with a 128 GB listing, especially if there is no microSD expansion.',
        verification: 'Match RAM, storage, colour, model number, and region before calling one seller cheaper.',
        caution: 'avoid price charts that omit the exact memory configuration',
      },
      {
        title: 'Launch-week scarcity and early premiums',
        lead: 'The first imported units often cost more because supply is limited and sellers carry more uncertainty around currency, delivery, and replacement stock.',
        impact: 'Paying an early premium may make sense for an enthusiast, but it usually weakens value for a budget-focused buyer.',
        verification: 'Compare the first-week quote with the seller’s promised dispatch date, cancellation rule, and warranty rather than looking at price alone.',
        caution: 'do not pay a scarcity premium for stock that the seller cannot prove is allocated',
      },
      {
        title: 'Warranty changes the real value',
        lead: 'Two identical phones can have different ownership value if one has a written local support route and the other depends entirely on an overseas seller or informal importer.',
        impact: 'A small upfront saving can disappear if a defective unit requires international shipping, long delays, or a disputed claim.',
        verification: 'Ask who receives the claim, where the phone is inspected, what proof is required, and which failures are excluded.',
        caution: 'treat “warranty available” as incomplete until the process is written',
      },
      {
        title: 'Charger, case, and delivery costs',
        lead: 'Nothing may confirm the box contents only at launch. If a charger is not included, the cost of a compatible PPS charger and reliable USB-C cable belongs in the buying budget.',
        impact: 'Cases, protectors, courier charges, insurance, and payment fees can turn a good headline price into an average final deal.',
        verification: 'Build one total that includes everything needed on day one, then compare that total with alternative phones.',
        caution: 'do not let a missing accessory cost appear only after checkout',
      },
      {
        title: 'How to compare Phone (4b) with Phone (4a) on price',
        lead: 'Phone (4a) has a known feature set and established retail price. Phone (4b) should be judged by how much it saves and which compromises create that saving.',
        impact: 'If the gap is small, the stronger camera, display, performance, or software promise of Phone (4a) may offer better long-term value.',
        verification: 'Compare the same storage, PTA category, warranty level, and included accessories after Phone (4b) is official.',
        caution: 'a lower model name does not automatically create better value',
      },
      {
        title: 'A practical price-check formula',
        lead: 'Start with the exact local device quote, add PTA cost if unpaid, add charger and protection, add delivery or payment charges, and subtract only genuine written discounts.',
        impact: 'This produces a final ownership cost that can be compared fairly across sellers and competing phones.',
        verification: 'Keep screenshots and ask the seller to confirm whether each line is included before paying.',
        caution: 'do not use a verbal promise to remove a large cost from the calculation',
      },
      {
        title: 'When a price is too low',
        lead: 'A quote far below the market can indicate a different storage variant, non-PTA status, open-box condition, repaired stock, a copied listing, or a seller using an unavailable price to attract messages.',
        impact: 'The cheapest number is only useful when the phone, condition, support, and delivery are real.',
        verification: 'Ask for live product evidence, sealed status, IMEI handling, invoice terms, business identity, and a payment method with records.',
        caution: 'leave the transaction when the explanation changes each time you ask',
      },
    ],
    faqs: [
      ['What is the Nothing Phone (4b) price in Pakistan?', 'No official Pakistan price has been announced before the 7 July 2026 reveal.'],
      ['Are online expected prices official?', 'No. They are estimates unless connected to a verified local listing from an accountable seller.'],
      ['When will the official price be known?', 'Nothing should announce initial market pricing on 7 July, while a Pakistan price may follow later.'],
      ['Will Phone (4b) be cheaper than Phone (4a)?', 'The b-series is expected to sit lower, but local price and variant differences must be confirmed.'],
      ['Why can Pakistan price be higher than direct conversion?', 'Import costs, taxes, currency risk, warranty, freight, payment fees, and seller margin affect local pricing.'],
      ['Does a low price usually mean non-PTA?', 'Sometimes, but not always. Ask explicitly and verify the IMEI status.'],
      ['What is the expected PTA-approved price?', 'It cannot be calculated reliably until the device valuation and local registration cost are known.'],
      ['Will 128 GB and 256 GB cost differently?', 'Yes, if both variants launch. Storage should always be included in a price comparison.'],
      ['Should I pre-order at an estimated price?', 'Only with written refund terms, exact variant details, PTA status, warranty, and a clear delivery date.'],
      ['Will the price fall after launch?', 'It may settle after early scarcity improves, but currency and import conditions can also push it upward.'],
      ['Does the phone include a charger?', 'Box contents are not confirmed before launch, so include a possible charger purchase in your budget.'],
      ['How should I compare two seller prices?', 'Match storage, colour, region, condition, PTA status, warranty, accessories, and delivery.'],
      ['Is cash on delivery safer?', 'It reduces some payment risk, but buyers still need clear inspection, return, and authenticity terms.'],
      ['Can a seller guarantee PTA tax before launch?', 'A precise guarantee is doubtful before valuation and IMEI registration details are available.'],
      ['What currency price matters most?', 'Use the price for the actual regional variant likely to reach Pakistan, including that market’s tax treatment.'],
      ['Should students wait for a stable price?', 'Usually yes, because early premiums can reduce the value advantage of an affordable model.'],
      ['Can warranty justify a higher price?', 'Yes. A clear local claim route can be worth more than a small saving from unsupported stock.'],
      ['What hidden costs should I include?', 'Include PTA, charger, cable, case, protector, delivery, payment fees, and possible warranty differences.'],
      ['Where will Nothing Pakistan publish the price?', 'Verified updates will appear on nothingpakistan.pk and the Phone (4b) Pakistan guide.'],
      ['What is the best price advice before launch?', 'Wait for official pricing and compare final ownership cost, not only the lowest headline.'],
    ],
  },
  {
    title: 'Nothing Phone 4b Specifications: Confirmed Design and Leaks Explained',
    slug: 'nothing-phone-4b-specifications-confirmed-design-leaks-explained',
    category: 'News',
    contentType: 'news',
    focusKeyword: 'Nothing Phone 4b specifications',
    metaDescription:
      'See confirmed Nothing Phone (4b) design details and understand leaked display, chipset, camera, battery, memory, and software claims before the July 7 launch.',
    excerpt:
      'Nothing has confirmed the Phone (4b) design but not the complete specification sheet. This guide separates visible facts from reported leaks and explains what Pakistan buyers should verify.',
    quickAnswer:
      'Confirmed Phone (4b) details include the 7 July reveal, a blue unibody design, two rear cameras, a centered front camera cutout, and a compact rear Glyph-style light bar. Reports point to a 6.7-inch 120 Hz AMOLED display, Snapdragon 6 Gen 4, 8 GB RAM, 128 GB or 256 GB storage, a 50 MP main camera, and a 5,400 mAh battery, but those numbers remain unconfirmed until Nothing publishes them.',
    pakistanLens:
      'a leaked specification is not enough to guarantee the same regional variant, network bands, charging package, software policy, or warranty in Pakistan',
    verdict:
      'Use the leaked sheet as a list of questions for 7 July, not as a final product page. The official regional specification and local buying terms should decide the purchase.',
    intro: [
      'Phone (4b) is in the unusual position of being visually official but technically unfinished in public. Nothing has shown the hardware from multiple angles, while the specification discussion is still driven by benchmark sightings and tipster reports.',
      'That makes careful labeling essential. A visible camera count is confirmed. A claimed sensor resolution is not. A rear light strip is confirmed. Its notification functions, zones, and software controls are not fully confirmed.',
      `This article keeps those layers separate and connects them to the practical questions Pakistan buyers should ask. The latest verified summary remains available on <a href="/nothing-phone-4b-pakistan">Nothing Pakistan’s Phone (4b) page</a>.`,
    ],
    points: [
      {
        title: 'Confirmed exterior and unibody direction',
        lead: 'Official imagery shows a blue phone with flat sides, a mostly clean lower rear panel, and a textured transparent-inspired area around the cameras and visible internal-style elements.',
        impact: 'The simpler lower section gives Phone (4b) a different visual balance from busier Nothing backs while retaining the brand’s recognizable industrial language.',
        verification: 'The design can be evaluated from official campaign images, but construction materials, glass type, weight, thickness, and repairability need published specifications.',
        caution: 'do not convert visual texture into an unsupported claim about material quality',
      },
      {
        title: 'Display claims: 6.7-inch AMOLED at 120 Hz',
        lead: 'Current reports describe a 6.7-inch AMOLED display with a 120 Hz refresh rate. The official front image shows a flat panel, centered camera cutout, and visibly wider bezels than premium Nothing models.',
        impact: 'AMOLED and 120 Hz would meet modern mid-range expectations, but brightness, resolution, PWM behavior, touch sampling, protection glass, and adaptive refresh range decide the real experience.',
        verification: 'Wait for Nothing to publish panel resolution, peak and high-brightness figures, refresh modes, and protection details.',
        caution: 'a 120 Hz label alone does not prove a bright or power-efficient screen',
      },
      {
        title: 'Chipset claim: Snapdragon 6 Gen 4',
        lead: 'A reported benchmark and later leaks point to Qualcomm’s Snapdragon 6 Gen 4, paired with an Adreno GPU and Android 16-based software.',
        impact: 'That platform would position Phone (4b) below Phone (4a)’s Snapdragon 7s Gen 4 and focus the decision on efficient daily performance rather than flagship-level gaming.',
        verification: 'The launch must confirm the exact chip, thermal design, storage type, software optimization, and update commitment.',
        caution: 'benchmark names and pre-release scores should not be treated as final retail performance',
      },
      {
        title: 'Memory claims: 8 GB with 128 GB or 256 GB',
        lead: 'Reports currently discuss two configurations: 8 GB RAM with 128 GB storage and 8 GB RAM with 256 GB storage. Nothing has not confirmed regional availability.',
        impact: 'The 256 GB option may be more comfortable for photos, offline media, games, and long ownership if there is no microSD expansion.',
        verification: 'Check usable storage, storage standard, RAM expansion marketing, and the exact Pakistan variant rather than only the headline memory.',
        caution: 'do not assume every announced capacity will be imported locally',
      },
      {
        title: 'Dual cameras and the 50 MP main-camera claim',
        lead: 'Two rear lenses are visible in official imagery. Leaks say the primary camera is 50 MP, but the second camera type and both sensor details remain unclear.',
        impact: 'Resolution does not reveal sensor size, lens quality, stabilization, image processing, night performance, or video limits.',
        verification: 'Look for OIS, sensor dimensions, aperture, ultrawide or depth function, 4K modes, stabilization, and sample quality after launch.',
        caution: 'avoid calling it a strong camera phone from megapixels alone',
      },
      {
        title: 'Battery claim: 5,400 mAh',
        lead: 'Reported specifications suggest a 5,400 mAh battery, which would be large for the expected category. Charging speed has not been established with the same confidence.',
        impact: 'Capacity can support good endurance, but chipset efficiency, display tuning, modem behavior, software, temperature, and background apps determine real battery life.',
        verification: 'Wait for the official rated and typical capacity, charging protocol, supported wattage, charge-time claim, and box contents.',
        caution: 'do not pair a leaked battery number with an invented charging speed',
      },
      {
        title: 'Glyph Bar rather than a full Glyph layout',
        lead: 'The rear image shows a short horizontal light element near the lower-right edge of the transparent area, similar in concept to the newer Glyph Bar approach.',
        impact: 'A compact light can still provide charging, timer, delivery, recording, or notification functions if software support is meaningful.',
        verification: 'The launch should identify the number of addressable zones, supported apps, customization, brightness controls, and accessibility behavior.',
        caution: 'do not assume every Phone (4a) Glyph function will transfer unchanged',
      },
      {
        title: 'Nothing OS and update support',
        lead: 'Reports expect Android 16 and a current Nothing OS release. That is plausible for a July 2026 device but has not replaced the need for an official support promise.',
        impact: 'The number of Android upgrades, security-patch duration, feature availability, and regional AI support matter more over time than the version printed on launch day.',
        verification: 'Find the exact software support statement and check whether Essential features require particular hardware, accounts, languages, or regions.',
        caution: 'do not promise every Phone (4a) AI feature on Phone (4b) without official confirmation',
      },
      {
        title: 'Connectivity and regional bands',
        lead: 'A modern Snapdragon platform would normally support 5G, but the useful question is which 4G and 5G bands are enabled on the variant sold to Pakistan buyers.',
        impact: 'Band compatibility affects Jazz, Zong, Ufone, Telenor, roaming, indoor coverage, and future 5G use.',
        verification: 'Check the exact model number, dual-SIM arrangement, supported bands, Wi-Fi version, Bluetooth version, NFC, and eSIM information.',
        caution: 'never infer full Pakistan compatibility from the chipset alone',
      },
      {
        title: 'Durability, dimensions, and box contents',
        lead: 'Official images cannot answer water-resistance rating, glass protection, frame material, repair options, weight, thickness, included case, screen protector, cable, or charger.',
        impact: 'These details influence daily comfort and the real first-day cost, especially when a phone is marketed as affordable.',
        verification: 'Use Nothing support documentation and the local box label after launch, because box contents can differ by region.',
        caution: 'do not copy another Nothing model’s durability or package details into Phone (4b)',
      },
    ],
    faqs: [
      ['What Phone (4b) specifications are confirmed?', 'The reveal date, blue exterior, two rear cameras, front camera cutout, and compact rear light bar are confirmed visually.'],
      ['Is the Snapdragon 6 Gen 4 confirmed?', 'It is strongly reported through leaks and benchmark coverage, but Nothing has not yet published the final specification.'],
      ['How large is the display?', 'Leaks point to a 6.7-inch panel; official size and resolution await the 7 July reveal.'],
      ['Will the screen be AMOLED?', 'Current reports say AMOLED, but the final panel specification should come from Nothing.'],
      ['Does Phone (4b) have 120 Hz?', 'A 120 Hz refresh rate is reported, not yet officially detailed.'],
      ['How much RAM will it have?', 'Reports mention 8 GB RAM. Regional configurations remain unconfirmed.'],
      ['What storage options are expected?', 'The most repeated leak lists 128 GB and 256 GB storage with 8 GB RAM.'],
      ['Does it support microSD?', 'Nothing has not confirmed expandable storage. Buyers should wait for the official sheet.'],
      ['What is the main camera resolution?', 'Leaks say 50 MP, while the official design only confirms that two rear cameras are present.'],
      ['What is the second rear camera?', 'Its purpose and resolution have not been confirmed.'],
      ['Does the main camera have OIS?', 'Optical stabilization has not been officially confirmed.'],
      ['What battery size is expected?', 'Reports point to 5,400 mAh, but official rated and typical capacities are still pending.'],
      ['What charging speed will Phone (4b) support?', 'Charging wattage and protocol are not confirmed before launch.'],
      ['Does it have Glyph lights?', 'Yes, a rear light bar is visible, but its complete software functions are not yet detailed.'],
      ['Which Android version will it use?', 'Android 16-based Nothing OS is expected, though the launch should confirm the shipping version.'],
      ['How many Android updates will it get?', 'Nothing has not published the Phone (4b) support promise yet.'],
      ['Will it support 5G in Pakistan?', 'Likely, but buyers must check the bands on the exact regional model.'],
      ['Does Phone (4b) have NFC?', 'NFC has not been officially confirmed for every market.'],
      ['Is Phone (4b) water resistant?', 'No official IP rating has been published yet.'],
      ['When will all specifications be confirmed?', 'Nothing is expected to publish the complete details at the 7 July 2026 reveal.'],
    ],
  },
  {
    title: 'Nothing Phone 4b vs Nothing Phone 4a: Should Pakistan Buyers Wait?',
    slug: 'nothing-phone-4b-vs-nothing-phone-4a-pakistan',
    category: 'Comparisons',
    contentType: 'comparison',
    focusKeyword: 'Nothing Phone 4b vs Nothing Phone 4a',
    metaDescription:
      'Compare Nothing Phone (4b) vs Phone (4a) for Pakistan: confirmed and leaked specs, cameras, performance, battery, price, PTA, and whether to wait.',
    excerpt:
      'Phone (4a) is the known mid-range option, while Phone (4b) is the upcoming lower-tier model. This comparison shows what is proven, what is still leaked, and who should wait.',
    quickAnswer:
      'Phone (4a) is the safer choice for buyers who need a phone now and value its confirmed Snapdragon 7s Gen 4 performance, 120 Hz 1.5K AMOLED display, three-camera system with periscope zoom, 5,080 mAh global battery, and 50 W charging. Phone (4b) may cost less and is reported to offer a 120 Hz AMOLED display, Snapdragon 6 Gen 4, dual cameras, and a 5,400 mAh battery, but its final value cannot be judged until the 7 July launch and Pakistan pricing.',
    pakistanLens:
      'the winner changes when local stock, exact storage, PTA status, warranty, and early-import premiums are included',
    verdict:
      'Wait until 7 July if your current phone can last. Choose Phone (4a) now only when you value its confirmed camera and performance advantages enough to accept the current local price.',
    intro: [
      'Phone (4b) versus Phone (4a) is not a normal completed comparison yet. One phone has a public product page and support documentation; the other has an official design and a set of credible but still unofficial hardware reports.',
      'The useful approach is to compare confidence as well as specifications. A confirmed Phone (4a) feature can support a buying decision today. A Phone (4b) leak can only tell buyers what to verify on 7 July.',
      `For live launch updates, use <a href="/nothing-phone-4b-pakistan">the Nothing Phone (4b) Pakistan guide</a>. For current devices, browse <a href="/collections/phones">Nothing phones available in Pakistan</a>.`,
    ],
    points: [
      {
        title: 'Positioning: b-series versus a-series',
        lead: 'Phone (4a) belongs to Nothing’s established mid-range a-series. Phone (4b) introduces a lower b-series tier that is expected to make the Nothing experience more accessible.',
        impact: 'A lower tier normally means carefully chosen compromises rather than a universally worse phone. The price difference should pay buyers back for every missing feature.',
        verification: 'Nothing’s launch explanation and official pricing will show whether Phone (4b) sits clearly below Phone (4a) or overlaps it.',
        caution: 'do not decide from the alphabet before seeing the final price gap',
      },
      {
        title: 'Design and Glyph approach',
        lead: 'Phone (4a) uses a more elaborate transparent-inspired design and a six-zone Glyph Bar. Phone (4b) shows a simpler unibody rear with a compact light strip and a vertically aligned dual-camera block.',
        impact: 'Some buyers may prefer Phone (4b)’s cleaner blue design, while others may see Phone (4a) as more distinctly Nothing.',
        verification: 'Compare official images, dimensions, materials, IP rating, weight, and the actual Glyph functions after the Phone (4b) reveal.',
        caution: 'appearance should not be used to assume durability or feature parity',
      },
      {
        title: 'Display quality',
        lead: 'Phone (4a) officially uses a 1.5K flexible AMOLED display with adaptive 30 to 120 Hz refresh and up to 4,500-nit peak brightness under stated conditions.',
        impact: 'Phone (4b) is reported to have a 6.7-inch 120 Hz AMOLED panel, but resolution, brightness, protection, and adaptive behavior are unknown.',
        verification: 'The launch must show whether Phone (4b) saves cost through resolution, brightness, glass, bezels, touch response, or panel tuning.',
        caution: 'do not call two displays equal because both say AMOLED and 120 Hz',
      },
      {
        title: 'Performance and storage',
        lead: 'Phone (4a) has the confirmed Snapdragon 7s Gen 4, UFS 3.1 storage, and multiple memory options. Phone (4b) is reported with Snapdragon 6 Gen 4 and 8 GB RAM.',
        impact: 'Phone (4a) should have the stronger performance ceiling, especially for heavier games, editing, and long-term multitasking. Phone (4b) may still be smooth for messaging, social apps, video, banking, navigation, and routine work.',
        verification: 'Compare official chip, storage type, cooling system, RAM options, software version, and sustained performance rather than one benchmark.',
        caution: 'a lower benchmark does not make a phone unusable, and a higher score does not guarantee cooler operation',
      },
      {
        title: 'Rear cameras and zoom',
        lead: 'Phone (4a) has a confirmed three-camera system with a 50 MP OIS main camera, 50 MP periscope telephoto camera with 3.5x optical zoom, and an ultrawide camera.',
        impact: 'Phone (4b) visibly has two rear cameras and is reported to use a 50 MP main sensor. It is unlikely to match the same optical zoom flexibility if a periscope lens is absent.',
        verification: 'Wait for Phone (4b) sensor details, OIS, second-camera purpose, video modes, and real samples.',
        caution: 'buyers who care about zoom, portraits, and travel photography should not assume software zoom replaces optical hardware',
      },
      {
        title: 'Battery and charging',
        lead: 'Phone (4a) has a 5,080 mAh global battery, with a larger India-rated capacity, and supports 50 W charging. Phone (4b) is reported with a 5,400 mAh battery.',
        impact: 'Phone (4b) could offer excellent endurance if the larger claim is correct, but charging speed, display efficiency, and chipset tuning remain important.',
        verification: 'Compare official capacities for the same region, supported charging protocol, charge-time claims, and included accessories.',
        caution: 'do not assume the larger battery automatically charges as quickly or lasts proportionally longer',
      },
      {
        title: 'Software and Essential features',
        lead: 'Phone (4a) ships with Android 16-based Nothing OS 4.1 and promotes Essential Space, Essential Search, Essential Memory, Essential Voice, Essential Apps, Gemini, and ChatGPT integration subject to availability.',
        impact: 'Phone (4b) is expected to use current Nothing OS, but lower-cost hardware or regional rollout may affect which functions are available.',
        verification: 'Check the official Phone (4b) feature list, update promise, language support, account requirements, and regional limitations.',
        caution: 'do not copy the Phone (4a) software marketing list into Phone (4b) before confirmation',
      },
      {
        title: 'Price and real ownership cost',
        lead: 'Phone (4a) has known international pricing and may already have local market stock. Phone (4b) has no official Pakistan price before launch.',
        impact: 'Phone (4b) only wins the value argument if its final PTA-adjusted, warranty-matched price is clearly lower than Phone (4a).',
        verification: 'Compare the same storage, PTA category, condition, warranty, charger needs, and delivery cost.',
        caution: 'ignore comparisons that use a leaked non-PTA Phone (4b) figure against a PTA-approved Phone (4a)',
      },
      {
        title: 'Who should buy Phone (4a)',
        lead: 'Choose Phone (4a) when you need a phone now, want stronger confirmed performance, value periscope zoom and a more complete camera system, or prefer a product with published support information.',
        impact: 'The higher price buys certainty and hardware that Phone (4b) may not target.',
        verification: 'Make sure the exact local Phone (4a) variant, PTA status, storage, and warranty meet the promise described in the listing.',
        caution: 'do not overpay simply because Phone (4a) is the known option',
      },
      {
        title: 'Who should wait for Phone (4b)',
        lead: 'Wait when budget is the priority, your current phone still works, you prefer the new blue design, or you want to see whether battery life and everyday performance are strong enough at a lower price.',
        impact: 'Waiting until 7 July costs only a short amount of time and replaces many assumptions with official facts.',
        verification: 'After launch, compare independent testing and stable Pakistan prices rather than ordering during the first wave of excitement.',
        caution: 'waiting makes sense only if you are willing to judge the final product honestly',
      },
    ],
    faqs: [
      ['Is Phone (4b) better than Phone (4a)?', 'It cannot be called better overall before launch. Phone (4a) has stronger confirmed hardware, while Phone (4b) may offer a lower price.'],
      ['Which phone is faster?', 'Phone (4a)’s Snapdragon 7s Gen 4 should outperform the reported Snapdragon 6 Gen 4 in Phone (4b).'],
      ['Which phone has the better camera?', 'Phone (4a) has the proven advantage with three cameras and 3.5x optical periscope zoom.'],
      ['Which phone has the bigger battery?', 'Leaks give Phone (4b) 5,400 mAh versus Phone (4a)’s 5,080 mAh global rating, but Phone (4b) is unconfirmed.'],
      ['Do both phones have 120 Hz AMOLED displays?', 'Phone (4a) does; Phone (4b) is reported to, pending official confirmation.'],
      ['Which phone has a brighter display?', 'Phone (4a) has published brightness claims. Phone (4b) brightness is not confirmed.'],
      ['Does Phone (4b) have periscope zoom?', 'The visible dual-camera layout does not confirm a periscope camera, and none has been officially announced.'],
      ['Do both have Glyph lighting?', 'Both show rear lighting, but the layout and supported functions may differ.'],
      ['Which phone will be cheaper in Pakistan?', 'Phone (4b) is expected to be cheaper, but Pakistan pricing and PTA status are required for a fair answer.'],
      ['Should I buy Phone (4a) before July 7?', 'Buy now only if you need a phone immediately and Phone (4a)’s known features justify its current price.'],
      ['Should students wait for Phone (4b)?', 'Yes, when budget matters and the current phone can last until official pricing is available.'],
      ['Which is better for gaming?', 'Phone (4a) should be stronger based on its confirmed chipset and cooling claims.'],
      ['Which is better for photography?', 'Phone (4a) is the safer choice for zoom and camera versatility.'],
      ['Which may have better battery life?', 'Phone (4b) could lead if the 5,400 mAh leak is correct and software is efficient, but testing is needed.'],
      ['Will both use Nothing OS?', 'Yes, Phone (4a) does and Phone (4b) is expected to; exact features and support must be confirmed.'],
      ['Which has more storage options?', 'Phone (4a) has confirmed variants. Phone (4b) is reported with 128 GB and 256 GB.'],
      ['Which is safer to buy today?', 'Phone (4a), because its specifications and support information are published.'],
      ['Could Phone (4a) price fall after Phone (4b)?', 'It may change with promotions and stock, but a lower-tier launch does not guarantee a permanent price cut.'],
      ['How should I compare Pakistan listings?', 'Match storage, PTA status, warranty, condition, accessories, and delivery before comparing prices.'],
      ['What is the final recommendation?', 'Wait for 7 July if possible, then choose Phone (4a) for stronger confirmed hardware or Phone (4b) for a genuinely lower final cost.'],
    ],
  },
  {
    title: 'Nothing Phone 4b PTA Approval, Tax and Network Guide for Pakistan',
    slug: 'nothing-phone-4b-pta-approval-tax-network-pakistan',
    category: 'Buying Guides',
    contentType: 'guide',
    focusKeyword: 'Nothing Phone 4b PTA approved Pakistan',
    metaDescription:
      'Check Nothing Phone (4b) PTA approval, expected tax process, IMEI verification, Jazz and Zong compatibility, imported variants, and 20 Pakistan buyer FAQs.',
    excerpt:
      'Phone (4b) PTA approval and tax are not confirmed before launch. Learn how to verify an IMEI, compare PTA and non-PTA listings, and check Pakistan network compatibility safely.',
    quickAnswer:
      'Nothing Phone (4b) is not automatically PTA approved simply because the model is official. PTA status belongs to the individual IMEI or approved local listing. Before buying in Pakistan, verify the exact device IMEI, ask whether tax is paid, confirm supported bands for the regional variant, and keep the seller’s PTA and warranty claims in writing.',
    pakistanLens:
      'a phone can have excellent global specifications and still create a poor local experience if its IMEI, bands, SIM arrangement, warranty, or tax status is unclear',
    verdict:
      'Buy only after the exact IMEI status, network bands, variant, warranty, and final tax-inclusive cost are clear. “Official phone” and “PTA-approved device” are not interchangeable phrases.',
    intro: [
      'PTA questions usually appear after a phone reaches Pakistan, but the safest buyers ask them before paying. Phone (4b) is especially likely to arrive through early import channels before stable local stock exists.',
      'The important distinction is between the model and the unit. Nothing can officially launch a model, while a particular imported unit still needs valid local cellular registration for unrestricted use on Pakistani networks.',
      `This guide explains the practical checks without pretending an exact tax amount is known before launch. For current release information, use <a href="/nothing-phone-4b-pakistan">the Phone (4b) Pakistan hub</a>.`,
    ],
    points: [
      {
        title: 'What PTA approval means for Phone (4b)',
        lead: 'PTA compliance allows the phone’s IMEI to operate on Pakistani cellular networks under the applicable registration rules. It does not describe camera quality, warranty, or whether the seller is authorized.',
        impact: 'A PTA-approved unit can use local SIM service normally, while a non-compliant imported unit may lose cellular access after the permitted period.',
        verification: 'Check the IMEI through the official PTA device verification route and compare the result with the number shown on the phone and box.',
        caution: 'do not accept a screenshot for another IMEI or a verbal claim that tax will be paid later',
      },
      {
        title: 'Why tax cannot be estimated precisely before launch',
        lead: 'A dependable tax calculation needs the recognized device identity, customs valuation, registration route, and current government treatment. Those details may not exist publicly before retail units arrive.',
        impact: 'Early websites can publish neat-looking numbers that later prove wrong, leaving the buyer with an unexpected cost.',
        verification: 'Use the official registration flow or current authority guidance for the exact IMEI after the model is recognized.',
        caution: 'treat every pre-launch PTA tax figure as provisional',
      },
      {
        title: 'Passport and CNIC registration context',
        lead: 'Pakistan device registration can involve different identity and eligibility conditions depending on the current route used. Rules and amounts can change.',
        impact: 'A tax estimate copied from another person may not apply to the buyer’s registration method or timing.',
        verification: 'Review the current official process when registering and ensure the identity details are yours and entered through the legitimate channel.',
        caution: 'never send identity documents or payment to an unverified person offering a shortcut',
      },
      {
        title: 'How to check the IMEI before accepting delivery',
        lead: 'Ask the seller for the IMEI only through a secure, accountable process, then compare the device settings, dial-code result, box label, and invoice when the parcel arrives.',
        impact: 'Matching identifiers reduce the risk of receiving a different unit from the one that was checked.',
        verification: 'Run the official status check again during the inspection period and save the result with the invoice.',
        caution: 'reject a parcel when identifiers are missing, altered, or inconsistent',
      },
      {
        title: 'Jazz, Zong, Ufone, and Telenor compatibility',
        lead: 'Phone (4b) is expected to support modern 4G and 5G connectivity, but the enabled bands on the exact regional model determine practical compatibility in Pakistan.',
        impact: 'Missing a locally important band can affect indoor signal, rural coverage, data consistency, carrier aggregation, roaming, or future 5G performance.',
        verification: 'Compare the model’s published LTE and NR band list with current operator requirements and ask which regional SKU the seller supplies.',
        caution: 'do not assume all Phone (4b) variants have identical radio support',
      },
      {
        title: 'Dual SIM, eSIM, and regional differences',
        lead: 'Nothing has not yet confirmed the Phone (4b) SIM arrangement for every market. Physical dual SIM, eSIM, or hybrid configurations can differ by region.',
        impact: 'Buyers who use separate personal and work numbers need the exact arrangement, not a generic specification copied from another country.',
        verification: 'Check the model number, SIM tray, settings support, and regional product documentation after launch.',
        caution: 'do not promise eSIM or dual physical SIM before the relevant variant is verified',
      },
      {
        title: 'PTA-approved versus non-PTA buying decision',
        lead: 'PTA-approved stock usually costs more upfront but gives a clearer path to normal mobile use. Non-PTA stock can suit a limited Wi-Fi device or a buyer who understands and budgets for later registration.',
        impact: 'Most people buying a primary phone should compare final tax-inclusive cost, because cellular service is central to banking codes, calls, maps, ride apps, and emergency use.',
        verification: 'Put the device price and verified registration cost on one line before comparing with approved alternatives.',
        caution: 'do not buy non-PTA simply because its advertisement appears first or cheapest',
      },
      {
        title: 'Temporary use and overseas phones',
        lead: 'Visitors and overseas Pakistanis may have specific temporary or registration options under current rules, but eligibility and duration should be checked at the time of use.',
        impact: 'A process suitable for a visitor may not create permanent local compliance for a phone sold onward to another person.',
        verification: 'Use official guidance for the user’s status and keep confirmation tied to the correct IMEI.',
        caution: 'do not market temporary access as permanent PTA approval',
      },
      {
        title: 'Warranty is separate from PTA',
        lead: 'A phone can be PTA approved and still have no useful local warranty. It can also have a seller warranty while remaining non-PTA.',
        impact: 'Buyers need both answers because cellular compliance does not pay for a defective display, camera, battery, or charging port.',
        verification: 'Ask for PTA status and warranty terms as separate written lines on the invoice.',
        caution: 'do not let one trust signal substitute for the other',
      },
      {
        title: 'A safe delivery inspection checklist',
        lead: 'Inspect the seal and condition, match the model and storage, verify IMEIs, test SIM recognition, check network registration, review the invoice, and keep an unboxing video when the seller’s policy permits.',
        impact: 'A structured inspection makes a dispute easier to explain and reduces the chance of discovering a mismatch after the return window closes.',
        verification: 'Confirm the seller’s inspection and return rules before dispatch so the buyer knows what can be opened or tested.',
        caution: 'report a mismatch immediately instead of continuing setup and hoping it resolves itself',
      },
    ],
    faqs: [
      ['Is Nothing Phone (4b) PTA approved?', 'The model is not automatically approved. Check the exact device IMEI or the seller’s verified approved listing.'],
      ['Will official launch make it PTA approved?', 'No. Global product launch and Pakistani cellular registration are separate matters.'],
      ['What is the Phone (4b) PTA tax?', 'No reliable exact amount is available before device valuation and registration details exist.'],
      ['Can PTA tax differ by registration route?', 'Yes. Current rules, identity route, and valuation can affect the applicable amount.'],
      ['How do I verify PTA status?', 'Use the official PTA device verification method for the exact IMEI and keep the result.'],
      ['Where can I find the IMEI?', 'It normally appears in phone settings, through the IMEI dial code, and on the box label.'],
      ['Should all IMEI numbers match?', 'Yes. The identifiers used for verification should match the device, box, and invoice.'],
      ['Can a dual-SIM phone have two IMEIs?', 'Yes. Verify every IMEI associated with the phone.'],
      ['Will Phone (4b) work on Jazz?', 'It should if the regional variant supports the required bands and the IMEI is compliant.'],
      ['Will Phone (4b) work on Zong?', 'Check the exact band list and PTA status for the supplied regional model.'],
      ['Will it work on Ufone and Telenor?', 'Compatibility depends on bands, local coverage, SIM provisioning, and PTA compliance.'],
      ['Does Phone (4b) support Pakistan 5G?', 'The final enabled 5G bands must be compared with future local network requirements.'],
      ['Can I use a non-PTA Phone (4b) on Wi-Fi?', 'Wi-Fi can work, but local cellular service may be restricted after the allowed period.'],
      ['Is a non-PTA phone cheaper?', 'Usually upfront, but add the verified registration cost before judging value.'],
      ['Is passport registration permanent?', 'Follow current official rules for the exact registration route; do not rely on old social posts.'],
      ['Can a seller pay PTA tax after delivery?', 'Only accept that arrangement with clear written terms and do not treat the phone as approved until verified.'],
      ['Does PTA approval include warranty?', 'No. Warranty and PTA status are separate.'],
      ['Can an imported variant have weaker network support?', 'Yes. Regional variants can differ, so check the exact SKU and bands.'],
      ['What should be written on the invoice?', 'Model, storage, colour, IMEI where appropriate, PTA status, condition, warranty, price, and seller identity.'],
      ['What is the safest purchase option?', 'A verified PTA-approved unit with clear local warranty and a documented inspection and return process.'],
    ],
  },
]

function pointSection(article, point, index) {
  const transitions = [
    'This is where launch excitement needs a little patience.',
    'The difference sounds small on paper, but it changes the buying decision.',
    'This detail deserves more attention than a headline specification.',
    'For a buyer comparing several phones, this is a useful dividing line.',
  ]
  return section(point.title, [
    point.lead,
    point.impact,
    `${transitions[index % transitions.length]} For Pakistan buyers, ${article.pakistanLens}.`,
    `${point.verification} Until that evidence is available, ${point.caution}.`,
  ])
}

function buildContent(article) {
  const parts = [
    `<article data-brand="${BRAND}" data-domain="nothingpakistan.pk" data-updated="${UPDATED_LABEL}">`,
    section('Quick Answer', [
      `<strong>${escapeHtml(article.quickAnswer)}</strong>`,
      'The short answer is deliberately cautious because Phone (4b) is confirmed but not fully launched. Visible design details can be described as facts; reported hardware numbers must remain labeled as leaks until Nothing publishes the final regional specification.',
      `Nothing Pakistan will update the connected <a href="/nothing-phone-4b-pakistan">Phone (4b) Pakistan guide</a> as verified launch, price, PTA, network, warranty, and availability information becomes available.`,
    ]),
    section('Why This Guide Matters Now', article.intro),
    '<section>',
    h2('Confirmed Phone (4b) Status Before 7 July'),
    p('The table below separates confirmed information from details that still require the launch presentation or a verified Pakistan listing. It is designed to prevent a visible design feature, a reported specification, and a local buying promise from being treated as the same kind of evidence.'),
    table(CONFIRMED_TABLE),
    '</section>',
    ...article.points.map((point, index) => pointSection(article, point, index)),
    section(`How to Research ${article.focusKeyword} Without Losing Context`, [
      `Start with the date attached to every claim. Phone (4b) information published before 7 July belongs to one of three groups: an official teaser, a reported leak, or an unsupported estimate. The same sentence can become outdated as soon as Nothing publishes the final product page, so a current article should say when it was checked and what kind of evidence supports it.`,
      `Next, identify the market. A price, battery rating, box package, SIM arrangement, warranty promise, or software feature from one country may not transfer unchanged to Pakistan. Regional product codes matter because ${article.pakistanLens}. A useful guide connects the global announcement to the exact device a local seller intends to deliver.`,
      'Then look for the missing detail, not only the exciting one. A display claim needs resolution and brightness. A camera claim needs sensor, lens, stabilization, and video information. A battery claim needs charging protocol and real endurance. A low price needs storage, PTA status, warranty, condition, and delivery terms. Missing context is where most poor comparisons begin.',
      `Finally, keep the buying decision reversible until the evidence is strong. Saving a listing, asking questions, or requesting a WhatsApp reminder costs little. Sending a non-refundable payment creates a much larger commitment. Nothing Pakistan recommends moving from interest to payment only when the exact Phone (4b) variant and the complete local terms can be checked in writing.`,
    ]),
    '<section>',
    h2('Pakistan Launch-Day Checklist'),
    p('Use this checklist after the presentation. It turns a fast launch stream into a slower, more useful buying record and helps expose listings that mix specifications from different regions.'),
    list([
      'Write down the official processor, RAM, storage, software version, and update promise.',
      'Record display size, resolution, refresh rate, brightness, protection, and fingerprint method.',
      'Check every rear camera sensor, stabilization feature, zoom method, and video limit.',
      'Confirm battery capacity, charging protocol, supported wattage, and box contents.',
      'Find the exact regional model number, SIM arrangement, LTE bands, 5G bands, NFC, Wi-Fi, and Bluetooth.',
      'Separate international price from Pakistan price and label PTA-approved and non-PTA amounts clearly.',
      'Ask who provides the warranty, where claims are handled, and which proof is required.',
      'Include charger, cable, case, protector, delivery, and payment fees in the final cost.',
      'Save the listing, invoice, seller replies, IMEI verification, and return policy.',
      'Wait when a seller cannot explain the exact variant, condition, dispatch date, or refund rule.',
    ]),
    '</section>',
    section('How Nothing Pakistan Will Update This Topic', [
      'The first update will replace launch-date language with the official specification and initial market pricing. Every previously reported number will either be confirmed, corrected, or removed.',
      'The second update will focus on Pakistan: likely regional variants, local price range, PTA guidance, network bands, warranty route, payment options, delivery timing, and available accessories.',
      'The third update will use real ownership evidence. Battery behavior, heat, camera consistency, signal quality, charging, software stability, and after-sales experience are more useful after testing than they are in a launch slide.',
      `Readers can also browse <a href="/blog">Nothing Pakistan buying guides</a>, <a href="/collections/phones">current Nothing phones</a>, and <a href="/contact-us">contact support</a> before ordering.`,
    ]),
    section('Final Recommendation', [
      article.verdict,
      'Phone launches reward curiosity but punish assumptions. The safest buyer can enjoy the design reveal, follow the rumours, and still wait for the exact regional facts before spending money.',
      `Use ${SITE_URL} as the local reference point, keep changing details dated, and compare complete ownership cost rather than the loudest launch-day claim.`,
    ]),
    '</article>',
  ]
  return parts.join('\n')
}

function validateContent(article, content) {
  const words = wordCount(content)
  const lines = content.split('\n').length
  if (words < 2000) throw new Error(`${article.slug} has only ${words} words`)
  if (lines < 150) throw new Error(`${article.slug} has only ${lines} lines`)
  if (article.faqs.length !== 20) throw new Error(`${article.slug} must have exactly 20 FAQs`)
  if (/https?:\/\/(?!www\.nothingpakistan\.pk)/i.test(content)) {
    throw new Error(`${article.slug} contains an external link`)
  }
  return { words, lines }
}

async function publishArticle(supabase, article, index) {
  const content = buildContent(article)
  const metrics = validateContent(article, content)
  const now = new Date().toISOString()

  console.log(`[${index + 1}/${ARTICLES.length}] Publishing ${article.title}`)
  const { data: blog, error: blogError } = await supabase
    .from('blogs')
    .upsert(
      {
        title: article.title,
        slug: article.slug,
        content,
        meta_title: `${article.title} | ${BRAND}`,
        meta_description: article.metaDescription,
        excerpt: article.excerpt,
        focus_keyword: article.focusKeyword,
        category: article.category,
        tags: [
          article.focusKeyword,
          'Nothing Phone 4b Pakistan',
          'Nothing Phone 4b price in Pakistan',
          'Nothing Phone 4b launch',
          'Nothing Pakistan',
        ],
        author: BRAND,
        author_type: 'brand',
        content_type: article.contentType,
        reading_time: Math.max(10, Math.ceil(metrics.words / 220)),
        is_published: true,
        published_at: now,
        updated_at: now,
      },
      { onConflict: 'slug' },
    )
    .select('id,title,slug')
    .single()
  if (blogError) throw new Error(`Blog upsert failed for ${article.slug}: ${blogError.message}`)

  const [{ error: imageDeleteError }, { error: faqDeleteError }] = await Promise.all([
    supabase.from('images').delete().eq('related_type', 'blog').eq('related_id', blog.id),
    supabase.from('faqs').delete().eq('related_type', 'blog').eq('related_id', blog.id),
  ])
  if (imageDeleteError) throw new Error(`Image cleanup failed for ${article.slug}: ${imageDeleteError.message}`)
  if (faqDeleteError) throw new Error(`FAQ cleanup failed for ${article.slug}: ${faqDeleteError.message}`)

  const { data: image, error: imageError } = await supabase
    .from('images')
    .insert({
      related_type: 'blog',
      related_id: blog.id,
      url: HERO_IMAGE,
      alt_text: `${article.title} - blue Nothing Phone (4b) official design`,
      title: article.title,
      caption: article.metaDescription,
      file_name: `${article.slug}.jpg`,
      slug: article.slug,
      sort_order: 0,
    })
    .select('id')
    .single()
  if (imageError) throw new Error(`Image insert failed for ${article.slug}: ${imageError.message}`)

  const { error: faqError } = await supabase.from('faqs').insert(
    article.faqs.map(([question, answer]) => ({
      related_type: 'blog',
      related_id: blog.id,
      question,
      answer,
      updated_at: now,
    })),
  )
  if (faqError) throw new Error(`FAQ insert failed for ${article.slug}: ${faqError.message}`)

  const { error: featuredError } = await supabase
    .from('blogs')
    .update({ featured_image_id: image.id, updated_at: now })
    .eq('id', blog.id)
  if (featuredError) throw new Error(`Featured image update failed for ${article.slug}: ${featuredError.message}`)

  return {
    id: blog.id,
    imageId: image.id,
    title: article.title,
    slug: article.slug,
    words: metrics.words,
    lines: metrics.lines,
    faqs: article.faqs.length,
  }
}

async function verify(supabase, published) {
  const ids = published.map((item) => item.id)
  const [{ data: blogs, error: blogError }, { data: faqs, error: faqError }, { data: images, error: imageError }] =
    await Promise.all([
      supabase
        .from('blogs')
        .select('id,title,slug,content,author,author_type,is_published,featured_image_id')
        .in('id', ids),
      supabase.from('faqs').select('related_id,question,answer').eq('related_type', 'blog').in('related_id', ids),
      supabase.from('images').select('id,related_id,url,alt_text').eq('related_type', 'blog').in('related_id', ids),
    ])
  if (blogError) throw blogError
  if (faqError) throw faqError
  if (imageError) throw imageError

  const faqCountByBlog = new Map()
  for (const faq of faqs ?? []) faqCountByBlog.set(faq.related_id, (faqCountByBlog.get(faq.related_id) ?? 0) + 1)
  const imageByBlog = new Map((images ?? []).map((image) => [image.related_id, image]))
  const failures = []

  for (const blog of blogs ?? []) {
    const words = wordCount(blog.content)
    const lines = blog.content.split('\n').length
    const faqCount = faqCountByBlog.get(blog.id) ?? 0
    const image = imageByBlog.get(blog.id)
    if (words < 2000) failures.push(`${blog.slug}: ${words} words`)
    if (lines < 150) failures.push(`${blog.slug}: ${lines} lines`)
    if (faqCount !== 20) failures.push(`${blog.slug}: ${faqCount} FAQs`)
    if (blog.author !== BRAND || blog.author_type !== 'brand') failures.push(`${blog.slug}: incorrect author`)
    if (!blog.is_published) failures.push(`${blog.slug}: not published`)
    if (!image || !image.url.startsWith('https://res.cloudinary.com/')) failures.push(`${blog.slug}: missing Cloudinary image`)
    if (blog.featured_image_id !== image?.id) failures.push(`${blog.slug}: featured image mismatch`)
    if (/https?:\/\/(?!www\.nothingpakistan\.pk)/i.test(blog.content)) failures.push(`${blog.slug}: external content link`)
  }
  if (failures.length) throw new Error(`Verification failed:\n${failures.join('\n')}`)
  return {
    fetchedBlogs: blogs?.length ?? 0,
    fetchedFaqs: faqs?.length ?? 0,
    fetchedImages: images?.length ?? 0,
  }
}

async function main() {
  loadEnv()
  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const slugs = ARTICLES.map((article) => article.slug)
  const { data: existing, error: existingError } = await supabase
    .from('blogs')
    .select('id,slug,title')
    .in('slug', slugs)
  if (existingError) throw existingError

  const published = []
  for (const [index, article] of ARTICLES.entries()) {
    published.push(await publishArticle(supabase, article, index))
  }
  const verified = await verify(supabase, published)
  const report = {
    publishedAt: new Date().toISOString(),
    existingMatchingSlugsBeforeRun: existing ?? [],
    insertedOrUpdated: published,
    verified,
    sourcesReviewed: [
      'Nothing official homepage Phone (4b) campaign and reveal timing',
      'Nothing official Phone (4a) product and support information',
      'Current Phone (4b) design coverage',
      'Current Phone (4b) benchmark and specification leak coverage',
    ],
  }
  mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
