import type { Metadata } from 'next'
import { PillarPageLayout } from '@/components/PillarPageLayout'
import { buildPillarPageMetadata, pillarPageConfigs } from '@/lib/data/pillar-pages'

const config = pillarPageConfigs['cmf-by-nothing-pakistan']

export const metadata: Metadata = buildPillarPageMetadata(config)

export default async function CmfByNothingPakistanPage() {
  return <PillarPageLayout config={config} />
}
