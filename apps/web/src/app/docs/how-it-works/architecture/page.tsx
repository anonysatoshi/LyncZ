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

export default function ArchitecturePage() {
  return (
    <>
      <Breadcrumbs path="/docs/how-it-works/architecture" />
      
      <h1 className="text-4xl font-bold tracking-tight mb-4 text-gray-900 dark:text-gray-100">
        LyncZ Architecture
      </h1>
      
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        Deep dive into the smart contracts and system design that powers trustless CNY-crypto trading.
      </p>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Smart Contracts (Base Mainnet)
      </h2>

      <p className="mb-6">
        LyncZ is powered by a set of smart contracts deployed on Base Mainnet. These contracts handle escrow, verification, and settlement.
      </p>

      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 my-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 pr-4">Contract</th>
              <th className="text-left py-2">Address</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-2 pr-4 font-medium">LyncZEscrow</td>
              <td className="py-2 font-mono text-xs">
                <a href="https://basescan.org/address/0x73e800bd2d407c23a2C0fa2998475D5fD6bAc0A2" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">0x73e800bd2d407c23a2C0fa2998475D5fD6bAc0A2</a>
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium">AlipayVerifier</td>
              <td className="py-2 font-mono text-xs">
                <a href="https://basescan.org/address/0xcB4f5383d087DeCc2DD57098c7352ee0D02250d4" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">0xcB4f5383d087DeCc2DD57098c7352ee0D02250d4</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-2xl font-semibold mt-8 mb-3">LyncZEscrow Contract</h3>

      <p className="mb-4">
        The escrow contract is the core of LyncZ&apos;s trustless design. It manages order creation, trade lifecycle, and token custody.
      </p>

      <ul className="list-disc pl-6 my-4 space-y-2">
        <li><strong>Order Management</strong> — Sellers create orders specifying token, amount, exchange rate, and payment account. Tokens are locked in the contract.</li>
        <li><strong>Trade Lifecycle</strong> — When a buyer fills an order, a time-limited trade is created. The buyer has 15 minutes to complete payment and submit proof.</li>
        <li><strong>Atomic Settlement</strong> — Upon valid proof verification, tokens are automatically released to the buyer. No manual intervention required.</li>
        <li><strong>Expiration Handling</strong> — If a trade expires without proof, tokens are returned to the order for future trades.</li>
      </ul>

      <h3 className="text-2xl font-semibold mt-8 mb-3">PaymentVerifier Contract</h3>

      <p className="mb-4">
        The verifier contract validates zkVM proofs and extracts public values for settlement. Each supported payment provider has its own verifier implementation.
      </p>

      <ul className="list-disc pl-6 my-4 space-y-2">
        <li><strong>Proof Verification</strong> — Calls the OpenVmHalo2Verifier to validate the cryptographic proof</li>
        <li><strong>Public Value Extraction</strong> — Extracts payment amount, seller account ID, and transaction ID from the proof</li>
        <li><strong>Commitment Verification</strong> — Ensures the proof was generated by the correct zkVM program</li>
      </ul>

      <h3 className="text-2xl font-semibold mt-8 mb-3">OpenVmHalo2Verifier Contract</h3>

      <p className="mb-4">
        The on-chain verifier for Axiom OpenVM proofs. This contract verifies Halo2 proofs generated by the zkVM.
      </p>

      <ul className="list-disc pl-6 my-4 space-y-2">
        <li><strong>Halo2 Verification</strong> — Implements the Halo2 proof verification algorithm on-chain</li>
        <li><strong>Gas Efficient</strong> — Optimized for low verification costs on Base L2</li>
      </ul>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Order System
      </h2>

      <p className="mb-4">
        LyncZ uses a simple order-based system where sellers list offers and buyers select which orders to fill.
      </p>

      <h3 className="text-2xl font-semibold mt-8 mb-3">Order Structure</h3>

      <p className="mb-4">
        Each order contains:
      </p>

      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 my-4">
        <ul className="space-y-2 text-sm">
          <li><strong>Token</strong> — The cryptocurrency being sold (USDC, WETH, cbBTC)</li>
          <li><strong>Amount</strong> — Total tokens available in the order</li>
          <li><strong>Exchange Rate</strong> — CNY per token</li>
          <li><strong>Min/Max Trade</strong> — Limits for individual trades</li>
          <li><strong>Payment Account</strong> — Seller&apos;s Alipay/WeChat account ID and name</li>
          <li><strong>Seller Address</strong> — Ethereum address of the seller</li>
        </ul>
      </div>

      <h3 className="text-2xl font-semibold mt-8 mb-3">Trade Flow</h3>

      <div className="space-y-4 my-6">
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-semibold">1</div>
          <div>
            <p className="font-medium">Buyer Browses Orders</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Buyer views available sell orders and selects one to fill</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-semibold">2</div>
          <div>
            <p className="font-medium">Trade Created</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">A trade is created on-chain, reserving tokens from the order. 15-minute timer starts.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-semibold">3</div>
          <div>
            <p className="font-medium">Payment & Proof</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Buyer pays via Alipay/WeChat, uploads receipt, zkVM generates proof</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
          <div className="bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-semibold">4</div>
          <div>
            <p className="font-medium">Settlement</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Proof verified on-chain, tokens automatically released to buyer</p>
          </div>
        </div>
      </div>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Security Properties
      </h2>

      <p className="mb-4">
        The architecture maintains the following security guarantees:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-green-500">✓</span> Token Safety
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tokens are held in the escrow contract and can only be released by valid proof or returned to seller after expiration.
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-green-500">✓</span> Atomic Settlement
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Either the trade completes successfully (buyer gets tokens) or it fails completely (tokens stay in order).
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-green-500">✓</span> No Front-Running
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Once a trade is created, those tokens are reserved for that specific buyer until settlement or expiration.
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-green-500">✓</span> Seller Control
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sellers can withdraw unfilled tokens from their orders at any time. They maintain full control over their liquidity.
          </p>
        </div>
      </div>

      <PageNavigation 
        prev={{ href: '/docs/how-it-works', title: 'How It Works' }}
        next={{ href: '/docs/how-it-works/zk-pdf', title: 'ZK-PDF Technology' }}
      />
    </>
  );
}
