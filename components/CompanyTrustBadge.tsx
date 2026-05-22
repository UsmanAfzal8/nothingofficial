import Link from 'next/link'
import { companyCuin, companyLegalName } from '@/lib/data/company'

type CompanyTrustBadgeProps = {
  tone?: 'light' | 'dark'
  compact?: boolean
  className?: string
}

export function CompanyTrustBadge({ tone = 'light', compact = false, className = '' }: CompanyTrustBadgeProps) {
  const isDark = tone === 'dark'

  return (
    <div
      className={`rounded-[8px] border p-4 ${
        isDark ? 'border-white/12 bg-white/[0.06] text-white' : 'border-black/10 bg-white text-black'
      } ${className}`}
    >
      <p className={`text-[10px] uppercase tracking-[0.24em] ${isDark ? 'text-white/58' : 'text-black/46'}`}>
        SECP Registered Company
      </p>
      <p className={`mt-2 text-sm leading-6 ${isDark ? 'text-white/88' : 'text-black/78'}`}>{companyLegalName}</p>
      <p className={`mt-1 text-xs ${isDark ? 'text-white/58' : 'text-black/50'}`}>CUIN: {companyCuin}</p>
      {!compact ? (
        <Link
          href="/company-verification"
          className={`mt-4 inline-flex h-9 items-center justify-center rounded-[8px] px-4 text-[10px] uppercase tracking-[0.2em] transition-colors ${
            isDark
              ? 'bg-white text-black hover:bg-white/86'
              : 'bg-black text-white hover:bg-black/82'
          }`}
        >
          View Certificate
        </Link>
      ) : (
        <Link
          href="/company-verification"
          className={`mt-3 inline-block text-[10px] uppercase tracking-[0.2em] underline-offset-4 hover:underline ${
            isDark ? 'text-white' : 'text-black'
          }`}
        >
          View Certificate
        </Link>
      )}
    </div>
  )
}
