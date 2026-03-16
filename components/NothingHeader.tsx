import { getNavigationMenuItems } from '@/lib/data/catalog-repository'
import { NothingHeaderClient } from '@/components/NothingHeaderClient'

export async function NothingHeader() {
  const menuItems = await getNavigationMenuItems()

  return <NothingHeaderClient menuItems={menuItems} />
}
