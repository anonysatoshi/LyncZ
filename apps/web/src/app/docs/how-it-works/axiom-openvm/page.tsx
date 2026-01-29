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

export default function AxiomOpenVMPage() {
  return (
    <>
      <Breadcrumbs path="/docs/how-it-works/axiom-openvm" />
      
      <h1 className="text-4xl font-bold tracking-tight mb-4 text-gray-900 dark:text-gray-100">
        Axiom OpenVM
      </h1>
      
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        The zero-knowledge virtual machine framework that powers LyncZ's cryptographic proofs.
      </p>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        What is a Zero-Knowledge Virtual Machine?
      </h2>

      <p className="mb-4">
        A <strong>zero-knowledge virtual machine (zkVM)</strong> is a virtual machine that can not only run any program, but also generate a zero-knowledge proof for its execution correctness.
      </p>

      <p className="mb-6">
        Think of it as a special computer that:
      </p>

      <ul className="list-disc pl-6 my-4 space-y-2">
        <li><strong>Executes programs:</strong> Just like a regular computer, it can run any program written in languages like Rust, C++, or Go</li>
        <li><strong>Generates cryptographic proofs:</strong> After execution, it produces a zero-knowledge proof certifying that the program ran correctly and produced the claimed output</li>
        <li><strong>Enables verification:</strong> Anyone can verify the proof (typically on a blockchain) without re-executing the entire program or seeing the private inputs</li>
      </ul>

      <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-6 my-8 rounded-r-lg">
        <p className="font-medium text-green-800 dark:text-green-200 mb-2">🔗 Example: Our zkPDF Rust Program</p>
        <p className="text-sm text-green-700 dark:text-green-300">
          LyncZ&apos;s <Link href="/docs/how-it-works/zk-pdf" className="underline hover:text-green-900 dark:hover:text-green-100">zkPDF verification program</Link> is written in Rust and executed inside the Axiom OpenVM.
          The program verifies payment provider signatures and extracts payment details from PDF receipts.
          OpenVM then generates a proof certifying: &quot;This Rust program executed correctly and output this specific hash.&quot;
          The smart contract verifies this proof on-chain without ever seeing the PDF or knowing how the computation was performed.
        </p>
      </div>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        What is Axiom OpenVM?
      </h2>

      <p className="mb-4">
        <strong>Axiom OpenVM</strong> is an open-source zero-knowledge virtual machine framework designed for customization and extensibility. It allows developers to write programs in Rust that execute inside a zero-knowledge proof system, generating cryptographic proofs of correct execution that can be verified on-chain.
      </p>

      <p className="mb-6">
        OpenVM features:
      </p>

      <ul className="list-disc pl-6 my-4 space-y-2">
        <li><strong>Modular no-CPU architecture:</strong> Flexible design allowing custom instruction sets</li>
        <li><strong>Extensible instruction set:</strong> Built-in support for cryptographic operations (RSA, SHA-256, elliptic curves)</li>
        <li><strong>Rust programming:</strong> Write zkVM programs in familiar Rust, compiled to ELF bytecode</li>
        <li><strong>Automatic Solidity verifier generation:</strong> Seamless blockchain integration with auto-generated smart contract verifiers</li>
      </ul>

      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg">
        <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">📚 Official Documentation</p>
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
          For comprehensive technical details, developer guides, and API references, visit the official OpenVM documentation:
        </p>
        <a
          href="https://docs.openvm.dev/book/getting-started/introduction"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          OpenVM Documentation →
        </a>
      </div>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        How LyncZ Uses OpenVM
      </h2>

      <p className="mb-4">
        LyncZ leverages the <strong>Axiom Proving API</strong>, a hosted cloud infrastructure service that enables reliable and cost-effective proof generation for OpenVM applications. Instead of running computationally intensive proof generation locally, we use Axiom's API to generate zero-knowledge proofs for our PDF verification program.
      </p>

      <p className="mb-6">
        When a buyer uploads their payment receipt, our <Link href="/docs/how-it-works/zk-pdf" className="text-blue-600 dark:text-blue-400 hover:underline">zkPDF Rust program</Link> is executed inside the Axiom OpenVM environment via the Axiom Proving API. The entire process—from PDF parsing and signature verification to payment detail extraction and proof generation—takes approximately <strong>5-10 minutes</strong> (expected to be under 1 minute in our next release).
      </p>

      <p className="mb-6">
        The Axiom Proving API handles the heavy computational workload, generating a succinct zero-knowledge proof that is then submitted to our smart contract on Base for verification. The proof is revealed on-chain, but no information about the buyer or payee is leaked — only the mathematical validity of the payment is proven. This approach allows us to focus on building a seamless user experience while maintaining strong security and privacy guarantees.
      </p>

      <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-6 my-8 rounded-r-lg">
        <p className="font-medium text-purple-800 dark:text-purple-200 mb-2">🔗 Axiom Proving API</p>
        <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
          Learn more about the Axiom Proving API that powers LyncZ's proof generation:
        </p>
        <a
          href="https://docs.axiom.xyz/user-guides/getting-started/introduction"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Axiom Proving API Documentation →
        </a>
      </div>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Security: What If the API Is Compromised?
      </h2>

      <p className="mb-4">
        A natural question arises: <em>What happens if the Axiom Proving API is compromised or malicious? Can an attacker steal funds?</em>
      </p>

      <p className="mb-4">
        The answer is <strong>no</strong>. The API cannot affect the security of funds on-chain. Here's why:
      </p>

      <div className="space-y-6 my-8">
        <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="font-medium mb-3">🔐 We Only Trust the API for Liveness</p>
          <p className="text-sm text-gray-700 dark:text-gray-400">
            The Axiom Proving API is trusted only for <strong>availability</strong> (liveness), not for security. If the API goes down or refuses to generate proofs, trades cannot complete — but no funds can be stolen. The API cannot generate a false proof that the smart contract would accept.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="font-medium mb-3">🧮 zkVM Cryptographic Soundness</p>
          <p className="text-sm text-gray-700 dark:text-gray-400">
            Zero-knowledge proofs have a fundamental property called <strong>soundness</strong>: it is mathematically impossible to generate a valid proof for a false statement. If someone submits a fake, photoshopped, or modified PDF receipt, the signature verification will fail inside the zkVM, and no valid proof can be generated — regardless of who controls the proving infrastructure.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="font-medium mb-3">📜 Verifier Logic Is Hardcoded On-Chain</p>
          <p className="text-sm text-gray-700 dark:text-gray-400">
            The smart contract's verifier logic is immutably deployed on the blockchain. It checks that the proof was generated by the correct program (via committed program hashes) and that the proof is cryptographically valid. Even if the proving API is completely compromised, the on-chain verifier will reject all invalid proofs.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="font-medium mb-3">🏠 Anyone Can Generate Proofs</p>
          <p className="text-sm text-gray-700 dark:text-gray-400">
            The Axiom OpenVM is open-source. In principle, anyone can run the proof generation themselves on their own hardware. We use the Axiom Proving API for <strong>speed and convenience</strong> — proof generation that might take hours locally can be done in minutes using their optimized infrastructure. But this is a performance choice, not a security dependency.
          </p>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-6 my-6 rounded-r-lg">
        <p className="font-medium text-green-800 dark:text-green-200 mb-2">Security Summary</p>
        <p className="text-sm text-green-700 dark:text-green-300">
          <strong>Worst-case scenario if the API is compromised:</strong> Trades halt (liveness failure), but no false transactions can proceed on-chain. User funds remain safe in the escrow contract. The cryptographic soundness of zkVM proofs ensures that only legitimate payment proofs will ever be accepted by the smart contract.
        </p>
      </div>

      <PageNavigation 
        prev={{ href: '/docs/how-it-works/zk-pdf', title: 'ZK-PDF Technology' }}
      />
    </>
  );
}
