import Image from "next/image";
import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      <Image src="/peak-logo.png" alt="Peak Logo" width={160} height={68} className="mb-8" />
      <h1 className="text-3xl font-bold mb-4 text-blue-900">Thank You!</h1>
      <p className="mb-4 text-lg text-gray-800 text-center">
        Your submission has been received.<br />
        A Peak Talent Capital Solutions team member will review your application and contact you soon.
      </p>
      <Link href="/">
        <button className="mt-6">Return to Home</button>
      </Link>
      <footer className="text-xs text-gray-500 mt-10 text-center">
        &copy; 2025 Pivot OS. All rights reserved.
      </footer>
    </div>
  );
}