import React from 'react';
import Link from 'next/link';

// Breadcrumb component
function Breadcrumbs({ path }: { path: string }) {
  const segments = path.split('/').filter(Boolean);
  
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
      <Link href="/" className="hover:text-gray-900 dark:hover:text-gray-100">Home</Link>
      {segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        const isLast = index === segments.length - 1;
        const label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        return (
          <span key={href} className="flex items-center gap-2">
            <span className="text-gray-400 dark:text-gray-600">/</span>
            {isLast ? (
              <span className="text-gray-900 dark:text-gray-100 font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-gray-900 dark:hover:text-gray-100">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

// Page navigation component
interface PageNavProps {
  prev?: { href: string; title: string };
  next?: { href: string; title: string };
}

function PageNavigation({ prev, next }: PageNavProps) {
  if (!prev && !next) return null;

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">
      {prev ? (
        <Link
          href={prev.href}
          className="flex flex-col p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">← Previous</span>
          <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next && (
        <Link
          href={next.href}
          className="flex flex-col p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all group text-right md:ml-auto"
        >
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Next →</span>
          <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {next.title}
          </span>
        </Link>
      )}
    </div>
  );
}

export default function IntroductionPage() {
  return (
    <>
      <Breadcrumbs path="/docs" />
      
      <h1 className="text-4xl font-bold tracking-tight mb-4 text-gray-900 dark:text-gray-100">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          LyncZ 灵犀支付 Documentation
        </span>
      </h1>
      
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        Welcome to LyncZ — the trustless peer-to-peer CNY-crypto exchange where smart contracts verify payment receipts cryptographically on Base.
      </p>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        What is LyncZ?
      </h2>

      <p className="mb-4">
        LyncZ (灵犀支付) enables <strong>trustless trading of cryptocurrency for CNY</strong> using Alipay or WeChat Pay, secured by cryptographic verification on the <strong>Base</strong> blockchain.
      </p>

      <p className="mb-4">
        When you pay via Alipay, the payment provider issues a <strong>digitally signed PDF receipt</strong>. Our smart contract verifies this signature cryptographically — if the signature is valid and the payment details match, the contract automatically releases the crypto to the buyer. No human intervention required.
      </p>

      <p className="mb-6">
        Unlike traditional crypto exchanges that require KYC, custody your funds, and can freeze your account, LyncZ operates as a <strong>peer-to-peer marketplace</strong> where buyers and sellers trade directly with mathematical guarantees.
      </p>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Quick Start
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        <Link
          href="/buy"
          className="flex flex-col p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all group bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10"
        >
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">Buy Crypto</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Trade CNY for USDC, WETH, or cbBTC. Send Alipay/WeChat payment, upload your receipt, and receive crypto automatically.
          </p>
          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-auto">
            Start buying →
          </span>
        </Link>

        <Link
          href="/sell"
          className="flex flex-col p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-500 hover:shadow-lg transition-all group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10"
        >
          <div className="text-4xl mb-4">💸</div>
          <h3 className="text-xl font-semibold mb-2 group-hover:text-green-600 dark:group-hover:text-green-400">Sell Crypto</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Create sell orders for your tokens. Lock crypto in escrow and receive CNY via Alipay/WeChat when buyers pay.
          </p>
          <span className="text-green-600 dark:text-green-400 text-sm font-medium mt-auto">
            Start selling →
          </span>
        </Link>
      </div>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Key Features
      </h2>

      <div className="space-y-6 my-8">
        <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-start">
            <div className="text-4xl mr-4">🔐</div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Cryptographic Receipt Verification</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                Payment receipts from Alipay contain <strong>digital signatures</strong>. Our smart contract verifies these signatures cryptographically to confirm payment validity.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Your PDF receipt is verified against the payment provider&apos;s signing key</li>
                <li>The verification result is submitted on-chain for settlement</li>
                <li>Zero personal information is revealed on-chain — no buyer identity, no payee details</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start">
            <div className="text-4xl mr-4">🤝</div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Peer-to-Peer Marketplace</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                Buyers and sellers trade directly. No KYC. No central authority. Your trades cannot be blocked, censored, or reversed.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>No exchange holds your funds — crypto is locked in smart contract escrow</li>
                <li>No account registration required — just connect your wallet</li>
                <li>Trades are settled by smart contracts, not human operators</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start">
            <div className="text-4xl mr-4">⚡</div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Automatic Settlement</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                Smart contracts execute trades instantly when payment receipts verify, ensuring fairness and speed.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Escrow contract locks seller&apos;s tokens until payment verification</li>
                <li>Receipt signature is verified cryptographically</li>
                <li>Upon successful verification, tokens are automatically released to the buyer</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-start">
            <div className="text-4xl mr-4">🛡️</div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Cryptographic Security</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                Mathematics enforces fairness and protects both parties — no trusted intermediaries required.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Seller cannot steal buyer&apos;s payment — crypto is locked in the escrow contract</li>
                <li>Buyer cannot fake payment — requires a valid digital signature from the payment provider</li>
                <li>Fake, photoshopped, or modified PDFs will fail verification since their signatures won&apos;t match</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        How It Works
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">1</span>
            Seller Creates Order
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            Seller lists crypto at a specified CNY exchange rate. Tokens are locked in a smart contract escrow until the order is filled or cancelled.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">2</span>
            Buyer Fills Order
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            Buyer selects an order and initiates a trade. The system creates a time-limited escrow with a 15-minute window for payment.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">3</span>
            Payment via Alipay/WeChat
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            Buyer sends CNY to seller&apos;s payment account. After payment, buyer downloads the digitally-signed PDF receipt from Alipay/WeChat.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">4</span>
            Verification & Settlement
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            Buyer uploads receipt. The smart contract verifies the digital signature and payment details, then releases tokens automatically.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg">
        <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">Want to Learn More?</p>
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
          Dive into the technical architecture and cryptographic verification that powers LyncZ.
        </p>
        <Link
          href="/docs/how-it-works"
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Read Technical Documentation →
        </Link>
      </div>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Supported Assets
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
          <div className="text-3xl mb-2">💵</div>
          <div className="font-semibold">USDC</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Circle USD Stablecoin</div>
        </div>
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg text-center hover:border-purple-500 dark:hover:border-purple-500 transition-colors">
          <div className="text-3xl mb-2">Ξ</div>
          <div className="font-semibold">WETH</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Wrapped Ethereum</div>
        </div>
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg text-center hover:border-orange-500 dark:hover:border-orange-500 transition-colors">
          <div className="text-3xl mb-2">₿</div>
          <div className="font-semibold">cbBTC</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Coinbase Wrapped Bitcoin</div>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
        All tokens are native assets on <strong>Base Mainnet</strong> (Ethereum L2, Chain ID: 8453).
      </p>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Platform Status
      </h2>

      <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-6 my-8 rounded-r-lg">
        <div className="flex items-start">
          <span className="text-3xl mr-4">✅</span>
          <div>
            <p className="font-medium text-green-800 dark:text-green-200 mb-2 text-lg">Live on Base Mainnet</p>
            <p className="text-sm text-green-700 dark:text-green-300 mb-2">
              LyncZ is now live on <strong>Base Mainnet</strong>. Trade real crypto for real CNY.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-green-700 dark:text-green-300">
              <li>Smart contracts deployed and verified on BaseScan</li>
              <li>Cryptographic verification powered by modern cryptography</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Network</div>
          <div className="font-semibold">Base Mainnet</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Chain ID: 8453</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</div>
          <div className="font-semibold text-green-600 dark:text-green-400">Live</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Production</div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Core Technology</div>
          <div className="font-semibold">Cryptographic Verification</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">RSA + SHA-256</div>
        </div>
      </div>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Learn More
      </h2>

      <div className="my-8">
        <Link
          href="/docs/how-it-works"
          className="flex flex-col p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all group"
        >
          <div className="text-4xl mb-4">⚙️</div>
          <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">How It Works</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm flex-1">
            Deep dive into the architecture and cryptographic verification that powers LyncZ.
          </p>
          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-4">
            Learn more →
          </span>
        </Link>
      </div>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Community & Support
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <a
          href="https://t.me/lyncz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-5 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
        >
          <div className="text-3xl">💬</div>
          <div className="flex-1">
            <div className="font-medium text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">Join Telegram</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Get support, report bugs, and discuss with the community</div>
          </div>
          <div className="text-gray-400">→</div>
        </a>

        <a
          href="https://github.com/anonysatoshi/LyncZ"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-5 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-500 dark:hover:border-gray-500 transition-colors group"
        >
          <div className="text-3xl">💻</div>
          <div className="flex-1">
            <div className="font-medium text-lg mb-1 group-hover:text-gray-600 dark:group-hover:text-gray-400">GitHub</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">View source code, contribute, and report issues</div>
          </div>
          <div className="text-gray-400">→</div>
        </a>
      </div>

      <PageNavigation 
        next={{ href: '/docs/how-it-works', title: 'How It Works' }}
      />
    </>
  );
}
