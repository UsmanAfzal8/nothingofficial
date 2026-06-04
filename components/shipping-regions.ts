export type ShippingLocation = {
  country: string
  locale: string
}

export type ShippingRegion = {
  name: string
  locations: ShippingLocation[]
}

export const shippingRegions: ShippingRegion[] = [
  {
    name: 'Europe',
    locations: [
      { country: 'Österreich', locale: 'English / (EUR)' },
      { country: 'Belgique', locale: 'English / (EUR)' },
      { country: 'България', locale: 'English / (BGN)' },
      { country: 'Hrvatska', locale: 'English / (EUR)' },
      { country: 'Česko', locale: 'English / (CZK)' },
      { country: 'Danmark', locale: 'English / (DKK)' },
      { country: 'Eesti', locale: 'English / (EUR)' },
      { country: 'Finland', locale: 'English / (EUR)' },
      { country: 'France', locale: 'Français / (EUR)' },
      { country: 'Deutschland', locale: 'Deutsch / (EUR)' },
      { country: 'Ελλάδα', locale: 'English / (EUR)' },
      { country: 'Magyarország', locale: 'English / (HUF)' },
      { country: 'Ireland', locale: 'English / (EUR)' },
      { country: 'Italia', locale: 'Italiano / (EUR)' },
      { country: 'Latvija', locale: 'English / (EUR)' },
      { country: 'Lietuva', locale: 'English / (EUR)' },
      { country: 'Luxembourg', locale: 'English / (EUR)' },
      { country: 'Malta', locale: 'English / (EUR)' },
      { country: 'Nederland', locale: 'English / (EUR)' },
      { country: 'Norge', locale: 'English / (NOK)' },
      { country: 'Polska', locale: 'English / (PLN)' },
      { country: 'Portugal', locale: 'English / (EUR)' },
      { country: 'Κύπρος Kıbrıs', locale: 'English / (EUR)' },
      { country: 'Romania', locale: 'English / (RON)' },
      { country: 'Slovensko', locale: 'English / (EUR)' },
      { country: 'Slovenija', locale: 'English / (EUR)' },
      { country: 'España', locale: 'Español / (EUR)' },
      { country: 'Sverige', locale: 'English / (SEK)' },
      { country: 'Suisse', locale: 'English / (CHF)' },
      { country: 'Türkiye', locale: 'Türkçe / (TRY)' },
      { country: 'United Kingdom', locale: 'English / (GBP)' },
    ],
  },
  {
    name: 'North America',
    locations: [
      { country: 'Canada', locale: 'English / (CAD)' },
      { country: 'United States', locale: 'English / (USD)' },
    ],
  },
  {
    name: 'Asia Pacific',
    locations: [
      { country: 'Pakistan', locale: 'English / (PKR)' },
      { country: 'Australia', locale: 'English / (AUD)' },
      { country: 'Hong Kong', locale: 'English / (HKD)' },
      { country: 'India', locale: 'English / (INR)' },
      { country: 'Indonesia', locale: 'English / (IDR)' },
      { country: '日本', locale: '日本語 / (JPY)' },
      { country: '대한민국', locale: '한국어 / (KRW)' },
      { country: 'Malaysia', locale: 'English / (MYR)' },
      { country: 'Nepal', locale: 'English / (NPR)' },
      { country: 'Philippines', locale: 'English / (PHP)' },
      { country: 'Singapore', locale: 'English / (SGD)' },
      { country: 'Sri Lanka', locale: 'English / (LKR)' },
      { country: 'Taiwan', locale: '繁體中文 / (NTD)' },
      { country: 'Thailand', locale: 'ภาษาไทย / (THB)' },
      { country: 'Việt Nam', locale: 'English / (USD)' },
    ],
  },
  {
    name: 'Latin America',
    locations: [
      { country: 'Chile', locale: 'Español / (USD)' },
      { country: 'Colombia', locale: 'Español / (USD)' },
      { country: 'México', locale: 'Español / (MXN)' },
    ],
  },
  {
    name: 'Middle East',
    locations: [
      { country: 'مملكة البحرين', locale: 'العربية / (BHD)' },
      { country: 'Israel', locale: 'English / (USD)' },
      { country: 'عُمان', locale: 'العربية / (OMR)' },
      { country: 'العراق', locale: 'العربية / (IQD)' },
      { country: 'قطر', locale: 'العربية / (QAR)' },
      { country: 'الكويت', locale: 'العربية / (KWD)' },
      { country: 'المملكة العربية السعودية', locale: 'العربية / (SAR)' },
      { country: 'الإمارات', locale: 'العربية / (AED)' },
    ],
  },
  {
    name: 'Other Countries and Regions',
    locations: [{ country: 'International', locale: 'English / (USD)' }],
  },
]
