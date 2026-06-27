type SeoStructuredDataProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>
}

export function SeoStructuredData({ data }: SeoStructuredDataProps) {
  const serializedData = JSON.stringify(data).replace(/</g, '\\u003c')

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializedData }} />
}
