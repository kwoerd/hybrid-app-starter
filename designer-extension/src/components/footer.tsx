import { Heart } from 'lucide-react';

const legalLinks = [
  { label: "TERMS", href: "https://retinaldelights.io/terms" },
  { label: "PRIVACY", href: "https://retinaldelights.io/privacy" },
  { label: "COOKIES", href: "https://retinaldelights.io/cookies" },
  { label: "MARKETPLACE TERMS", href: "https://www.retinaldelights.io/marketplace-terms" },
  { label: "LICENSE AGREEMENT", href: "https://retinaldelights.io/nft-license-agreement" },
  { label: "NFT LISTING", href: "https://retinaldelights.io/nft-listing-policy" },
  { label: "ACCEPTABLE USE", href: "https://retinaldelights.io/acceptable-use-policy" },
  { label: "DISCLAIMER", href: "https://retinaldelights.io/disclaimer" },
]

export default function Footer() {
  return (
    <footer className="border-t border-neutral-700 bg-background">
      <div className="container mx-auto py-6 px-4 text-center">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex items-center justify-center py-2">
            <img
              src="/retinal_delights-horizontal-brand-offwhite.svg"
              alt="Retinal Delights"
              className="w-auto h-10 sm:h-12 md:h-14 max-h-14"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-[10px] text-neutral-400 max-w-3xl">
            <div className="flex flex-wrap justify-center gap-3 mb-1">
              {legalLinks.slice(0, 3).map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#ff0099] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {legalLinks.slice(3).map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#ff0099] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="my-4 max-w-3xl mx-auto h-px bg-brand-pink opacity-20"></div>

        <div className="flex flex-col items-center text-xs text-neutral-400">
          <div className="mb-1">
            Created with <Heart className="inline-block h-3 w-3 mx-1 text-brand-pink fill-brand-pink" /> in Los Angeles by{" "}
            <a
              href="https://kristenwoerdeman.com"
              className="font-medium text-brand-pink hover:text-[#ff0099] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kristen
            </a>
          </div>

          <div className="font-medium">
            2025 ©{" "}
            <a
              href="https://retinaldelights.io"
              className="text-brand-pink hover:text-[#ff0099] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Retinal Delights, Inc.
            </a>{" "}
            All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}