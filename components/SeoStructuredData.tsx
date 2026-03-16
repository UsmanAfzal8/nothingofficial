type SeoStructuredDataProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>
}

export function SeoStructuredData({ data }: SeoStructuredDataProps) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
