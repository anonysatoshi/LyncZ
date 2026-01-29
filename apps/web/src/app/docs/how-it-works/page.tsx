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

export default function HowItWorksPage() {
  return (
    <>
      <Breadcrumbs path="/docs/how-it-works" />
      
      <h1 className="text-4xl font-bold tracking-tight mb-4 text-gray-900 dark:text-gray-100">
        How LyncZ Works
      </h1>
      
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        Understanding the architecture and zkVM technology that enables trustless CNY-crypto trading.
      </p>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Technical Overview
      </h2>

      <p className="mb-4">
        LyncZ combines <strong>blockchain smart contracts</strong>, <strong>digitally signed PDF receipts</strong>, and <strong>zero-knowledge virtual machines (zkVM)</strong> to enable trustless peer-to-peer trading between cryptocurrency and fiat currency (CNY) via Alipay or WeChat Pay.
      </p>

      <p className="mb-4">
        The core innovation is using a <strong>zkVM</strong> to verify payment receipts. Payment receipts from supported providers contain <strong>RSA digital signatures</strong>. The zkVM executes a verification program that validates these signatures and extracts payment details, producing a cryptographic proof that can be verified on-chain — without revealing any personal information.
      </p>

      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 my-6">
        <h3 className="font-semibold mb-3">Core Technical Stack</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-purple-500">•</span>
            <span><strong>zkVM:</strong> Axiom OpenVM (RISC-V based, Halo2 proof system)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span><strong>Blockchain:</strong> Base Mainnet (Ethereum L2, optimized for low gas fees)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">•</span>
            <span><strong>Smart Contracts:</strong> Escrow, Verifier, and Settlement contracts in Solidity</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500">•</span>
            <span><strong>Backend:</strong> Rust relay service for order matching and proof orchestration</span>
          </li>
        </ul>
      </div>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        System Components
      </h2>

      <p className="mb-6">
        LyncZ consists of three main technical components. Click each to learn more:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        <Link
          href="/docs/how-it-works/architecture"
          className="flex flex-col p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all group"
        >
          <div className="text-4xl mb-4">🏗️</div>
          <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">Smart Contract Architecture</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            The escrow contract, order lifecycle, trade states, and on-chain verification flow.
          </p>
        </Link>

        <Link
          href="/docs/how-it-works/zk-pdf"
          className="flex flex-col p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all group"
        >
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400">ZK-PDF Verification</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            How the zkVM extracts and verifies RSA signatures from payment provider PDF receipts.
          </p>
        </Link>

        <Link
          href="/docs/how-it-works/axiom-openvm"
          className="flex flex-col p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-500 hover:shadow-lg transition-all group"
        >
          <div className="text-4xl mb-4">⚙️</div>
          <h3 className="text-xl font-semibold mb-2 group-hover:text-green-600 dark:group-hover:text-green-400">Axiom OpenVM</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            The RISC-V based zero-knowledge virtual machine that powers payment verification.
          </p>
        </Link>
      </div>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Trade Lifecycle
      </h2>

      <div className="space-y-6 my-8">
        <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">1</div>
          <div>
            <h4 className="font-semibold mb-1">Order Creation</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Seller creates an order specifying the token, amount, CNY exchange rate, and their Alipay/WeChat account. Tokens are locked in the escrow smart contract.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">2</div>
          <div>
            <h4 className="font-semibold mb-1">Trade Initiation</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Buyer selects an order and initiates a trade. A time-limited escrow is created with a 15-minute window for the buyer to complete payment.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">3</div>
          <div>
            <h4 className="font-semibold mb-1">Payment & Receipt Upload</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Buyer sends CNY to seller&apos;s Alipay/WeChat account, then downloads and uploads the PDF receipt. The PDF contains an RSA-2048 signature from the payment provider.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">4</div>
          <div>
            <h4 className="font-semibold mb-1">zkVM Proof Generation</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The backend sends the PDF to Axiom OpenVM. The zkVM executes a verification program that validates the RSA signature and extracts payment details. A Halo2 proof is generated (~2-3 minutes).
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
          <div className="bg-cyan-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">5</div>
          <div>
            <h4 className="font-semibold mb-1">On-Chain Verification & Settlement</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The proof is submitted on-chain and verified by the verifier contract. If valid, the escrow contract automatically releases tokens to the buyer.
            </p>
          </div>
        </div>
      </div>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Why zkVM?
      </h2>

      <p className="mb-4">
        A <strong>zero-knowledge virtual machine (zkVM)</strong> is a computational environment that can execute arbitrary programs and produce cryptographic proofs of correct execution. Unlike traditional ZK circuits which are purpose-built for specific computations, a zkVM allows us to write verification logic in standard programming languages.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-purple-500">🔧</span> Flexibility
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            We can write complex verification logic (PDF parsing, RSA signature verification) in Rust instead of custom ZK circuits. This makes the code easier to audit and maintain.
          </p>
        </div>

        <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-blue-500">🔐</span> Privacy
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The zkVM proves that computation was done correctly without revealing the input data. Your payment receipt stays private — only the proof is shared.
          </p>
        </div>

        <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-green-500">✓</span> Soundness
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            It is mathematically impossible to generate a valid proof for a fake or modified receipt. If the RSA signature doesn&apos;t verify, no proof can be produced.
          </p>
        </div>

        <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-orange-500">📦</span> Succinctness
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The proof is tiny regardless of how complex the original computation was. This keeps on-chain verification gas costs low.
          </p>
        </div>
      </div>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Security Model
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-green-500">✓</span> Seller Protection
          </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tokens can only be released by a valid zkVM proof that contains a matching payment amount, seller account ID, and valid RSA signature from the payment provider.
            </p>
        </div>

        <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-green-500">✓</span> Buyer Protection
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Once a trade is created, the seller cannot withdraw those tokens. If the buyer provides a valid proof within the time window, settlement is guaranteed.
          </p>
        </div>

        <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-green-500">✓</span> zkVM Soundness
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Fake, photoshopped, or modified PDF receipts cannot generate valid proofs. If the RSA signature doesn&apos;t verify, no proof can be produced — it&apos;s mathematically impossible to forge.
          </p>
        </div>

        <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-green-500">✓</span> Privacy Preservation
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The zkVM proof reveals nothing about the payment receipt contents except that it satisfies the verification constraints. No personal data is ever stored on-chain.
          </p>
        </div>
      </div>

      <PageNavigation 
        prev={{ href: '/docs', title: 'Introduction' }}
        next={{ href: '/docs/how-it-works/architecture', title: 'Architecture' }}
      />
    </>
  );
}
