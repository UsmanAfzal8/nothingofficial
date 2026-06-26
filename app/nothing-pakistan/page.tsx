import type { Metadata } from 'next'
import { PillarPageLayout } from '@/components/PillarPageLayout'
import { buildPillarPageMetadata, pillarPageConfigs } from '@/lib/data/pillar-pages'

const config = pillarPageConfigs['nothing-pakistan']

export const metadata: Metadata = buildPillarPageMetadata(config)

export default async function NothingPakistanPage() {
  return <PillarPageLayout config={config} />
}
