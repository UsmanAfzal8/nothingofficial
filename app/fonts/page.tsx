import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { notFound } from 'next/navigation'
import { NothingFooter } from '@/components/NothingFooter'
import { NothingHeader } from '@/components/NothingHeader'
import { buildAbsoluteUrl, buildRobotsMetadata } from '@/lib/utils/seo'

const ndot55 = localFont({ src: '../../fonts/Ndot55-Regular.otf', display: 'swap' })
const ndot55Caps = localFont({ src: '../../fonts/Ndot55Caps-Regular.otf', display: 'swap' })
const georgia = localFont({ src: '../../fonts/georgia.ttf', display: 'swap' })
const interLight = localFont({ src: '../../fonts/Inter-Light.otf', display: 'swap' })
const interMedium = localFont({ src: '../../fonts/Inter-Medium.otf', display: 'swap' })
const interRegular = localFont({ src: '../../fonts/Inter-Regular.ttf', display: 'swap' })
const interVariableItalic = localFont({ src: '../../fonts/InterVariable-Italic.ttf', display: 'swap' })
const letteraLight = localFont({ src: '../../fonts/LetteraMonoLL-Light.otf', display: 'swap' })
const letteraLightItalic = localFont({ src: '../../fonts/LetteraMonoLL-LightItalic.otf', display: 'swap' })
const letteraRegular = localFont({ src: '../../fonts/LetteraMonoLL-Regular.otf', display: 'swap' })
const letteraItalic = localFont({ src: '../../fonts/LetteraMonoLL-Italic.otf', display: 'swap' })
const letteraMedium = localFont({ src: '../../fonts/LetteraMonoLL-Medium.otf', display: 'swap' })
const letteraMediumItalic = localFont({ src: '../../fonts/LetteraMonoLL-MediumItalic.otf', display: 'swap' })
const ndot57 = localFont({ src: '../../fonts/Ndot57-Regular.otf', display: 'swap' })
const ndot57Caps = localFont({ src: '../../fonts/Ndot57Caps-Regular.otf', display: 'swap' })
const ndot77 = localFont({ src: '../../fonts/Ndot77JPExtended.ttf', display: 'swap' })
const ntype82Regular = localFont({ src: '../../fonts/NType82-Regular.otf', display: 'swap' })
const ntype82Headline = localFont({ src: '../../fonts/NType82-Headline.otf', display: 'swap' })
const ntype82Mono = localFont({ src: '../../fonts/NType82Mono-Regular.otf', display: 'swap' })
const spaceGrotesk = localFont({ src: '../../fonts/SpaceGrotesk-Regular.otf', display: 'swap' })
const spaceMono = localFont({ src: '../../fonts/SpaceMono-Regular.otf', display: 'swap' })

const fontSamples = [
  { name: 'Ndot55 Regular', file: 'Ndot55-Regular.otf', format: 'OTF', font: ndot55 },
  { name: 'Ndot55 Caps Regular', file: 'Ndot55Caps-Regular.otf', format: 'OTF', font: ndot55Caps },
  { name: 'Ndot57 Regular', file: 'Ndot57-Regular.otf', format: 'OTF', font: ndot57 },
  { name: 'Ndot57 Caps Regular', file: 'Ndot57Caps-Regular.otf', format: 'OTF', font: ndot57Caps },
  { name: 'Ndot77 JP Extended', file: 'Ndot77JPExtended.ttf', format: 'TTF', font: ndot77 },
  { name: 'NType82 Regular', file: 'NType82-Regular.otf', format: 'OTF', font: ntype82Regular },
  { name: 'NType82 Headline', file: 'NType82-Headline.otf', format: 'OTF', font: ntype82Headline },
  { name: 'NType82 Mono Regular', file: 'NType82Mono-Regular.otf', format: 'OTF', font: ntype82Mono },
  { name: 'Lettera Mono LL Light', file: 'LetteraMonoLL-Light.otf', format: 'OTF', font: letteraLight },
  { name: 'Lettera Mono LL Light Italic', file: 'LetteraMonoLL-LightItalic.otf', format: 'OTF', font: letteraLightItalic },
  { name: 'Lettera Mono LL Regular', file: 'LetteraMonoLL-Regular.otf', format: 'OTF', font: letteraRegular },
  { name: 'Lettera Mono LL Italic', file: 'LetteraMonoLL-Italic.otf', format: 'OTF', font: letteraItalic },
  { name: 'Lettera Mono LL Medium', file: 'LetteraMonoLL-Medium.otf', format: 'OTF', font: letteraMedium },
  { name: 'Lettera Mono LL Medium Italic', file: 'LetteraMonoLL-MediumItalic.otf', format: 'OTF', font: letteraMediumItalic },
  { name: 'Inter Light', file: 'Inter-Light.otf', format: 'OTF', font: interLight },
  { name: 'Inter Medium', file: 'Inter-Medium.otf', format: 'OTF', font: interMedium },
  { name: 'Inter Regular', file: 'Inter-Regular.ttf', format: 'TTF', font: interRegular },
  { name: 'Inter Variable Italic', file: 'InterVariable-Italic.ttf', format: 'TTF', font: interVariableItalic },
  { name: 'Space Grotesk Regular', file: 'SpaceGrotesk-Regular.otf', format: 'OTF', font: spaceGrotesk },
  { name: 'Space Mono Regular', file: 'SpaceMono-Regular.otf', format: 'OTF', font: spaceMono },
  { name: 'Georgia', file: 'georgia.ttf', format: 'TTF', font: georgia },
] as const

const pageTitle = 'Nothing Font Preview'
const pageDescription = 'Preview every local font file used in the project with the Our new campaign for Headphone (a) sample text.'

export const metadata: Metadata = {
  title: {
    absolute: pageTitle,
  },
  description: pageDescription,
  alternates: {
    canonical: buildAbsoluteUrl('/fonts'),
  },
  robots: buildRobotsMetadata(),
}

export default async function FontsPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f3f3ef] text-[#111]">
      <NothingHeader />

      <main className="pt-20">
        <section className="border-b border-black/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(255,255,255,0.6)_36%,rgba(231,231,226,0.92)_100%)] px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto grid max-w-screen-2xl gap-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-end">
            <div className="max-w-4xl">
              <p className="text-[10px] uppercase tracking-[0.3em] text-black/48">Font Page</p>
              <h1 className="mt-4 text-5xl font-semibold leading-[0.92] tracking-[-0.04em] text-black sm:text-6xl">
                Our new campaign for Headphone (a) across every local font file.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-black/66">
                Each row uses the real font file from the project&apos;s <span className="font-medium text-black">/fonts</span> folder, with the font name and file name shown beside the preview.
              </p>
            </div>

            <div className="grid gap-3 border border-black/10 bg-black p-5 text-white">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/56">Samples</p>
                <p className="mt-2 text-3xl font-semibold">{fontSamples.length}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/56">Preview Text</p>
                <p className="mt-2 text-sm text-white/82">Our new campaign for Headphone (a)</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-8 md:px-8 md:py-10">
          <div className="mx-auto grid max-w-screen-2xl gap-4">
            {fontSamples.map((sample, index) => (
              <article
                key={sample.file}
                className="grid gap-5 border border-black/10 bg-white px-5 py-5 shadow-[0_18px_42px_rgba(17,17,17,0.05)] md:grid-cols-[220px_minmax(0,1fr)] md:items-center md:px-6"
              >
                <div className="flex items-start justify-between gap-4 md:block">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-black/42">Font {String(index + 1).padStart(2, '0')}</p>
                    <h2 className="mt-2 text-lg font-semibold leading-tight text-black">{sample.name}</h2>
                    <p className="mt-1 text-sm text-black/58">{sample.file}</p>
                  </div>
                  <span className="shrink-0 border border-black/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-black/52">
                    {sample.format}
                  </span>
                </div>

                <div className="border-t border-black/8 pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                  <p
                    className={`${sample.font.className} break-words text-[clamp(2rem,5vw,4.75rem)] leading-[1.02] text-black`}
                    style={{ fontFamily: sample.font.style.fontFamily }}
                  >
                    Our new campaign for Headphone (a)
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <NothingFooter />
    </div>
  )
}
