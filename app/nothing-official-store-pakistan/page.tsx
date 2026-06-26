import type { Metadata } from 'next'
import { PillarPageLayout } from '@/components/PillarPageLayout'
import { buildPillarPageMetadata, pillarPageConfigs } from '@/lib/data/pillar-pages'

const config = pillarPageConfigs['nothing-official-store-pakistan']

export const metadata: Metadata = buildPillarPageMetadata(config)

export default async function NothingOfficialStorePakistanPage() {
  return <PillarPageLayout config={config} />
}
