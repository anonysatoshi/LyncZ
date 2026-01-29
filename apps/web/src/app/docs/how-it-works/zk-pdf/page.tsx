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

export default function ZKPDFPage() {
  return (
    <>
      <Breadcrumbs path="/docs/how-it-works/zk-pdf" />
      
      <h1 className="text-4xl font-bold tracking-tight mb-4 text-gray-900 dark:text-gray-100">
        ZK-PDF Technology
      </h1>
      
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        How LyncZ cryptographically verifies payment receipts without revealing sensitive information.
      </p>

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        What are Zero-Knowledge Proofs?
      </h2>

      <p className="mb-4">
        A <strong>zero-knowledge proof (ZKP)</strong> is a cryptographic protocol that allows one party (the <em>prover</em>) to prove to another party (the <em>verifier</em>) that a statement is true, without revealing any additional information beyond the truth of the statement itself.
      </p>

      <p className="mb-6">
        Zero-knowledge proofs have three fundamental properties:
      </p>

      <div className="space-y-6 my-8">
        <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="font-medium mb-3">1. Completeness</p>
          <p className="text-sm text-gray-700 dark:text-gray-400">
            If the statement is true and both parties follow the protocol honestly, the verifier will be convinced. Honest provers can always convince honest verifiers of true statements.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="font-medium mb-3">2. Soundness</p>
          <p className="text-sm text-gray-700 dark:text-gray-400">
            If the statement is false, no cheating prover can convince the verifier that it is true (except with negligible probability). It is cryptographically impossible to fake a valid proof for a false statement.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="font-medium mb-3">3. Zero-Knowledge</p>
          <p className="text-sm text-gray-700 dark:text-gray-400">
            The verifier learns nothing beyond the truth of the statement. The proof reveals zero additional information about the underlying data or how the statement was proven. Your secrets remain completely private.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg">
        <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Example: Proving You Paid Without Revealing Details</p>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          In LyncZ, you can prove "I paid exactly 1,000 CNY to seller Alice at a specific time" without revealing:
          your full transaction history, your account balance, your real name, your phone number, or any other personal information.
          The verifier (smart contract) only learns that the payment statement is true—nothing more.
        </p>
      </div>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        What is zkPDF?
      </h2>

      <p className="mb-4">
        <strong>zkPDF</strong> is a specialized zero-knowledge proof system that proves properties about PDF documents. It enables <strong>verifiable data extraction from signed PDFs</strong> while maintaining complete privacy.
      </p>

      <p className="mb-4">
        Specifically, zkPDF verifies three key properties:
      </p>

      <ol className="list-decimal pl-6 my-4 space-y-3">
        <li>
          <strong>Authenticity:</strong> The PDF is digitally signed by a trusted payment provider
        </li>
        <li>
          <strong>Content Matching:</strong> Specific fields in the PDF contain expected values (account name, account ID, amount, transaction ID, payment time)
        </li>
        <li>
          <strong>Privacy:</strong> Sensitive information in the PDF is never revealed on-chain or to any third party
        </li>
      </ol>

      <p className="mt-6 mb-6">
        Learn more about the zkPDF project: <a href="https://pse.dev/blog/zkpdf-unlocking-verifiable-data" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">zkPDF: Unlocking Verifiable Data</a>
      </p>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        Payment Provider PDF Receipts
      </h2>

      <p className="mb-4">
        When someone sends money via a supported payment provider (Alipay, WeChat Pay, etc.), they can request an official <strong>digitally signed PDF receipt</strong>. This receipt contains:
      </p>

      <ul className="list-disc pl-6 my-4 space-y-1">
        <li>Payer information (name and account ID, partially masked)</li>
        <li><strong>Payee name</strong> (partially masked with asterisks)</li>
        <li><strong>Payee account ID</strong> (phone or email, partially masked)</li>
        <li><strong>Transaction amount</strong> (exact value in CNY)</li>
        <li><strong>Transaction ID</strong> (unique identifier from the payment provider)</li>
        <li><strong>Payment time</strong> (exact timestamp)</li>
        <li><strong>PKCS#7 Digital Signature</strong> (cryptographically binds all content)</li>
      </ul>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        PKCS#7 Digital Signatures
      </h2>

      <p className="mb-4">
        Payment provider PDFs use industry-standard <strong>PKCS#7</strong> (Public-Key Cryptography Standards #7), also known as CMS (Cryptographic Message Syntax).
      </p>

      <h3 className="text-2xl font-semibold mt-8 mb-3">Signature Components</h3>

      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm my-4">
{`Algorithm: RSA with SHA-256
Key Size: 2048-bit RSA
Standard: PAdES (PDF Advanced Electronic Signatures)
Format: ASN.1 DER-encoded
Content Type OID: 1.2.840.113549.1.7.2 (SignedData)`}
      </pre>

      <h3 className="text-2xl font-semibold mt-8 mb-3">Signature Structure</h3>

      <ul className="list-disc pl-6 my-4 space-y-2">
        <li>
          <strong>SignedData:</strong> PKCS#7 container that holds all signature-related information
        </li>
        <li>
          <strong>Certificates:</strong> The payment provider&apos;s certificate chain, proving the signing key belongs to them
        </li>
        <li>
          <strong>Signed Attributes:</strong> Includes document hash (SHA-256), timestamp, and content type
        </li>
        <li>
          <strong>Encrypted Digest:</strong> RSA signature over the signed attributes
        </li>
      </ul>

      <h3 className="text-2xl font-semibold mt-8 mb-3">ByteRange Mechanism</h3>

      <p className="mb-4">
        PDFs use a clever mechanism to sign themselves without including the signature in the signed data:
      </p>

      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm my-4">
{`/ByteRange [offset1 length1 offset2 length2]`}
      </pre>

      <p className="mb-4">
        This creates two byte ranges that exclude the signature value itself, ensuring the signature covers the entire document except for the signature field itself, preventing any tampering.
      </p>

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <h2 className="text-3xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        The zkPDF Verification Program
      </h2>

      <p className="mb-4">
        LyncZ implements a <strong>Rust program</strong> that performs cryptographic verification of payment provider PDF receipts. This program is compiled to ELF bytecode and executed inside the Axiom OpenVM zero-knowledge virtual machine to generate proofs.
      </p>

      <h3 className="text-2xl font-semibold mt-8 mb-3">Program Inputs</h3>

      <p className="mb-4">The verification program takes the following inputs:</p>

      <ul className="list-disc pl-6 my-4 space-y-2">
        <li><strong>PDF bytes:</strong> The entire payment receipt PDF file</li>
        <li><strong>Line numbers:</strong> Specific line numbers to extract from the PDF containing payment details</li>
      </ul>

      <h3 className="text-2xl font-semibold mt-8 mb-3">Receipt Content</h3>

      <p className="mb-4">The program extracts specific fields from the PDF receipt:</p>

      <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800 my-6">
        <ul className="space-y-2 text-sm">
          <li><strong>Account Name:</strong> Payee&apos;s account name (partially masked)</li>
          <li><strong>Account ID:</strong> Payee&apos;s account identifier (partially masked)</li>
          <li><strong>Transaction ID:</strong> Unique transaction identifier from the payment provider</li>
          <li><strong>Payment Time:</strong> Timestamp of the payment</li>
          <li><strong>Amount:</strong> Payment amount in CNY</li>
        </ul>
      </div>

      <h3 className="text-2xl font-semibold mt-8 mb-3">Program Logic</h3>

      <p className="mb-4">The verification program performs two key operations:</p>

      <div className="space-y-6 my-8">
        <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="font-medium mb-3">Stage 1: Digital Signature Verification</p>
          <ol className="list-decimal pl-5 space-y-2 text-sm">
            <li>Parse the PKCS#7 SignedData structure from the PDF</li>
            <li>Extract and verify the RSA signature using the payment provider&apos;s public key</li>
            <li>Compute the public key DER hash for commitment</li>
            <li>Set <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">is_valid = true</code> if signature verification passes</li>
          </ol>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="font-medium mb-3">Stage 2: Content Extraction</p>
          <ol className="list-decimal pl-5 space-y-2 text-sm">
            <li>Extract text content from the PDF</li>
            <li>Locate the specified line numbers in the extracted text</li>
            <li>Extract the text content at each requested line</li>
          </ol>
        </div>
      </div>

      <h3 className="text-2xl font-semibold mt-8 mb-3">Program Output</h3>

      <p className="mb-4">The program outputs a single SHA-256 hash that commits to all verified data:</p>

      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm my-4">
{`lines_hash = SHA256(line_num_1 || line_text_1 || line_num_2 || line_text_2 || ...)
output = SHA256(is_valid || public_key_hash || lines_hash)`}
      </pre>

      <p className="mb-4">Where:</p>

      <ul className="list-disc pl-6 my-4 space-y-2">
        <li><code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">is_valid</code> = 1 if signature verification passed, 0 otherwise</li>
        <li><code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">public_key_hash</code> = SHA-256 hash of the payment provider&apos;s public key in DER format</li>
        <li><code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">lines_hash</code> = SHA-256 hash of all extracted line numbers and their content</li>
      </ul>

      <p className="mb-6">
        This single hash output serves as a commitment to the verification result. The zero-knowledge proof certifies that this hash was correctly computed by the program running inside the zkVM.
      </p>

      <h3 className="text-2xl font-semibold mt-8 mb-3">Smart Contract Verification</h3>

      <p className="mb-4">
        The smart contract (PaymentVerifier) performs a parallel hash computation to verify the proof:
      </p>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg border-l-4 border-blue-500 my-6">
        <p className="font-medium text-blue-800 dark:text-blue-200 mb-3">Contract-Side Hash Computation</p>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <li><strong>Reconstruct expected lines:</strong> The contract builds the expected line content from the trade parameters (account name, account ID, amount, etc.)</li>
          <li><strong>Compute lines_hash:</strong> SHA256 of all line numbers and texts</li>
          <li><strong>Compute expected output:</strong> SHA256(0x01 || providerPublicKeyHash || lines_hash)</li>
          <li><strong>Compare hashes:</strong> Verify the proof output matches the expected hash</li>
          <li><strong>Verify ZK proof:</strong> Call the Halo2 verifier to cryptographically verify the proof</li>
        </ol>
      </div>

      <p className="mb-4">
        This verification ensures:
      </p>

      <ul className="list-disc pl-6 my-4 space-y-2">
        <li>✅ The PDF was signed by the payment provider&apos;s authentic signing key</li>
        <li>✅ The payment details match the expected trade parameters</li>
        <li>✅ The proof was generated by the correct verification program (zkVM soundness)</li>
        <li>✅ No personal information is revealed on-chain</li>
      </ul>

      <PageNavigation 
        prev={{ href: '/docs/how-it-works/architecture', title: 'Architecture' }}
        next={{ href: '/docs/how-it-works/axiom-openvm', title: 'Axiom OpenVM' }}
      />
    </>
  );
}
