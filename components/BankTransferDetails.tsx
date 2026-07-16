'use client'

import { useState } from 'react'
import { bankDetails } from '@/lib/data/bank-details'

type CopyField = 'accountNumber' | 'iban'

function BankIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 9h18L12 3 3 9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M5 10.5v6M9.5 10.5v6M14.5 10.5v6M19 10.5v6M3 20h18M4 17.5h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const input = document.createElement('textarea')
  input.value = value
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  input.remove()
}

export function BankTransferDetails({ className = '' }: { className?: string }) {
  const [copiedField, setCopiedField] = useState<CopyField | null>(null)

  async function handleCopy(field: CopyField, value: string) {
    try {
      await copyText(value)
      setCopiedField(field)
      window.setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1800)
    } catch {
      setCopiedField(null)
    }
  }

  return (
    <div className={`rounded-[5px] border border-black/14 bg-[#f4f4f2] p-4 sm:p-5 ${className}`.trim()}>
      <div className="flex items-center gap-3 border-b border-black/10 pb-4">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white">
          <BankIcon />
        </span>
        <div>
          <p className="text-[0.64rem] uppercase tracking-[0.16em] text-black/48">Bank details</p>
          <p className="mt-1 text-sm font-semibold text-black">{bankDetails.bankName}</p>
        </div>
      </div>

      <dl className="mt-4 grid gap-4">
        <div>
          <dt className="text-[0.62rem] uppercase tracking-[0.14em] text-black/46">Account title</dt>
          <dd className="mt-1 break-words text-sm font-semibold text-black">{bankDetails.accountTitle}</dd>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <dt className="text-[0.62rem] uppercase tracking-[0.14em] text-black/46">Account number</dt>
            <dd className="mt-1 break-all [font-family:var(--font-lettera-regular)] text-sm text-black">{bankDetails.accountNumber}</dd>
          </div>
          <button
            type="button"
            onClick={() => handleCopy('accountNumber', bankDetails.accountNumber)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[5px] border border-black/16 bg-white px-3 text-[0.62rem] uppercase tracking-[0.12em] text-black transition hover:border-black"
            aria-label="Copy bank account number"
          >
            <CopyIcon />
            {copiedField === 'accountNumber' ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <dt className="text-[0.62rem] uppercase tracking-[0.14em] text-black/46">IBAN</dt>
            <dd className="mt-1 break-all [font-family:var(--font-lettera-regular)] text-sm text-black">{bankDetails.iban}</dd>
          </div>
          <button
            type="button"
            onClick={() => handleCopy('iban', bankDetails.iban)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[5px] border border-black/16 bg-white px-3 text-[0.62rem] uppercase tracking-[0.12em] text-black transition hover:border-black"
            aria-label="Copy IBAN"
          >
            <CopyIcon />
            {copiedField === 'iban' ? 'Copied' : 'Copy'}
          </button>
        </div>
      </dl>
    </div>
  )
}
