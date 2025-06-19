import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-[#fdf7ee] to-gray-200">
      {/* Banner Logo */}
      <div className="flex justify-center w-full mb-4 mt-10">
        <img
          src="/peak-talent-capital-banner.png"
          alt="Peak Talent Capital Solutions"
          className="rounded-lg shadow-md border border-peak-gold bg-white"
          style={{
            maxWidth: '220px',   // Strict width limit
            height: 'auto',
            width: '100%',
            padding: '12px',
            background: 'white',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
      {/* Card */}
      <section className="bg-white/95 border border-peak-gold rounded-3xl shadow-2xl px-8 py-10 max-w-xl w-full flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-peak-gold mb-1 text-center drop-shadow-sm">
          Welcome to <span className="text-gray-800">The Peak Recruitment Platform</span>
        </h1>
        <p className="mb-8 text-lg md:text-xl text-gray-700 text-center max-w-xl font-medium">
          Your gateway to top job postings, easy applications, and master recruiter tools.
        </p>
        {/* Main Links */}
        <div className="w-full flex flex-col gap-5 sm:flex-row sm:gap-6 justify-center mb-4">
          <Link
            href="/job-board"
            className="flex-1 px-6 py-4 bg-peak-gold text-white rounded-xl text-lg font-bold shadow-lg hover:bg-yellow-600 hover:shadow-xl transition text-center ring-1 ring-peak-gold focus:outline-peak-gold"
          >
            Job Board
          </Link>
          <Link
            href="/preapp"
            className="flex-1 px-6 py-4 bg-peak-blue text-white rounded-xl text-lg font-bold shadow-lg hover:bg-blue-800 hover:shadow-xl transition text-center ring-1 ring-blue-700 focus:outline-peak-blue"
          >
            Apply Now
          </Link>
          <Link
            href="/control-panel"
            className="flex-1 px-6 py-4 bg-gray-700 text-white rounded-xl text-lg font-bold shadow-lg hover:bg-gray-900 hover:shadow-xl transition text-center ring-1 ring-gray-700 focus:outline-gray-700"
          >
            Recruiter Panel
          </Link>
        </div>
        {/* Visit PeakTCS.com */}
        <div className="flex justify-center mt-6 w-full">
          <a
            href="https://peaktcs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-white to-gray-100 border-2 border-peak-gold text-peak-gold rounded-lg text-base md:text-lg font-semibold shadow hover:bg-peak-gold hover:text-white hover:from-peak-gold hover:to-yellow-100 transition min-w-[220px] text-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path stroke="currentColor" strokeWidth="2" d="M2 12h20M12 2a10 10 0 000 20M12 2a10 10 0 010 20" /></svg>
            Visit PeakTCS.com
          </a>
        </div>
      </section>
      {/* Footer */}
      <footer className="mt-12 mb-6 px-4 text-gray-600 text-sm text-center w-full max-w-xl">
        <hr className="my-8 border-peak-gold" />
        <p>
          Peak is an Equal Opportunity Employer.<br />
          &copy; {new Date().getFullYear()} PivotOS. All rights reserved.
        </p>
      </footer>
    </main>
  );
}