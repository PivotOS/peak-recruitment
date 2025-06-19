"use client";

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ location: '', jobType: '', keywords: '' });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsQuery = query(collection(db, 'jobs'), where('status', '==', 'open'));
        const querySnapshot = await getDocs(jobsQuery);
        const jobList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        jobList.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        setJobs(jobList);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };
    fetchJobs();
  }, []);

  const applyFilter = (job) => {
    const { location, jobType, keywords } = filters;
    const matchesLocation = !location || (job.location && job.location.toLowerCase().includes(location.toLowerCase()));
    const matchesJobType = !jobType || job.jobType === jobType;
    const matchesKeywords =
      !keywords ||
      (job.title && job.title.toLowerCase().includes(keywords.toLowerCase())) ||
      (job.description && job.description.toLowerCase().includes(keywords.toLowerCase()));
    return matchesLocation && matchesJobType && matchesKeywords;
  };

  const isJobExpired = (deadline) => (deadline && new Date(deadline) < new Date());

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-br from-white via-[#fdf7ee] to-gray-200 py-10">
      {/* Home Button (goes to peaktcs.com) */}
      <div className="w-full max-w-7xl mb-6 flex">
        <a
          href="https://peaktcs.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2 bg-peak-blue text-white rounded-lg text-base font-semibold shadow hover:bg-blue-800 transition"
        >
          ← Home
        </a>
      </div>
      {/* Logo */}
      <div className="text-center mb-6">
        <img
          src="/peaklogo.png"
          alt="Peak Logo"
          className="mx-auto w-[340px] max-w-full h-auto"
          loading="lazy"
        />
      </div>
      {/* Main Card */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/95 border border-peak-gold rounded-3xl shadow-2xl px-8 py-10 max-w-7xl w-full flex flex-col items-center"
      >
        <h1 className="text-4xl text-yellow-600 font-bold tracking-tight mb-6 text-center">
          Peak Job Board
        </h1>
        {/* Filters */}
        <div className="mb-10 w-full max-w-4xl bg-white p-6 rounded-2xl shadow-md border border-yellow-200">
          <h2 className="text-2xl mb-4 text-yellow-600 font-bold">Search & Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-gray-800 text-lg" htmlFor="filter-location">
                Location
              </label>
              <input
                id="filter-location"
                type="text"
                value={filters.location}
                onChange={e => setFilters({ ...filters, location: e.target.value })}
                className="w-full p-4 border border-yellow-500 rounded-lg text-lg outline-none bg-white focus:ring-2 focus:ring-yellow-500"
                placeholder="e.g., Chicago, IL"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-800 text-lg" htmlFor="filter-jobType">
                Job Type
              </label>
              <select
                id="filter-jobType"
                value={filters.jobType}
                onChange={e => setFilters({ ...filters, jobType: e.target.value })}
                className="w-full p-4 border border-yellow-500 rounded-lg text-lg outline-none bg-white focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">All</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
                <option value="Temporary to Hire">Temporary to Hire</option>
                <option value="Direct Hire">Direct Hire</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-gray-800 text-lg" htmlFor="filter-keywords">
                Keywords
              </label>
              <input
                id="filter-keywords"
                type="text"
                value={filters.keywords}
                onChange={e => setFilters({ ...filters, keywords: e.target.value })}
                className="w-full p-4 border border-yellow-500 rounded-lg text-lg outline-none bg-white focus:ring-2 focus:ring-yellow-500"
                placeholder="e.g., IT, Sales"
                autoComplete="off"
              />
            </div>
          </div>
        </div>
        {/* Job Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {jobs.length === 0 ? (
            <p className="text-gray-600 text-lg col-span-full text-center">
              No open job postings available.
            </p>
          ) : (
            jobs.filter(applyFilter).map(job => {
              if (isJobExpired(job.deadline)) return null;
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-7 border-2 border-yellow-400 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">{job.title || 'Untitled Job'}</h2>
                    <p className="text-gray-600 text-base mb-1">Location: <span className="font-semibold">{job.location || 'Unknown'}</span></p>
                    <p className="text-gray-600 text-base mb-1">
                      Compensation: <span className="font-semibold">
                        {job.compensationType === 'payRate'
                          ? job.payRate || 'Unknown'
                          : job.compensationType === 'salary'
                            ? job.salary || 'Unknown'
                            : `${job.salaryMin || 'Unknown'} - ${job.salaryMax || 'Unknown'}`}
                      </span>
                    </p>
                    <p className="text-gray-600 text-base mb-1">Type: <span className="font-semibold">{job.jobType || 'Unknown'}</span></p>
                    {job.shiftInfo && (
                      <p className="text-gray-600 text-base mb-1">Shift: <span className="font-semibold">{job.shiftInfo}</span></p>
                    )}
                    <p className="text-gray-600 text-base mb-1">Category: <span className="font-semibold">{job.category || 'None'}</span></p>
                    <p className="text-gray-600 text-base mb-1">
                      Posted: <span className="font-semibold">{job.dateAdded ? new Date(job.dateAdded).toLocaleDateString() : 'Unknown'}</span>
                    </p>
                    <p className="text-gray-600 text-base mb-2">
                      Deadline: <span className="font-semibold">{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Unknown'}</span>
                    </p>
                    {job.perks && (
                      <p className="text-gray-600 text-base mb-1">Perks: <span className="font-semibold">{job.perks}</span></p>
                    )}
                    {job.meritMessage && (
                      <p className="text-blue-600 text-sm italic mb-2">{job.meritMessage}</p>
                    )}
                  </div>
                  <Link
                    href={`/preapp?jobId=${job.id}`}
                    className="block w-full mt-4 p-4 bg-peak-gold text-white text-center rounded-lg text-lg font-semibold hover:bg-yellow-600 transition-colors duration-200"
                    prefetch={false}
                  >
                    Apply Now
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
        {/* Footer */}
        <footer className="mt-10 w-full text-center text-gray-800 text-sm">
          <hr className="my-8 border-peak-gold" />
          <p className="font-semibold">Peak is an Equal Opportunity Employer.</p>
          <p>
            It is the policy of Peak Employment Solutions, LLC to provide equal employment opportunity (EEO) to all persons regardless of age, color, national origin, citizenship status, physical or mental disability, race, religion, creed, gender, sex, sexual orientation, gender identity and/or expression, genetic information, marital status, status with regard to public assistance, veteran status, or any other characteristic protected by federal, state or local law. In addition, Peak Employment Solutions, LLC will provide reasonable accommodations for qualified individuals with disabilities.
          </p>
          <p className="mt-6 text-xs text-gray-400">
            &copy; {new Date().getFullYear()} PivotOS. All rights reserved.
          </p>
        </footer>
      </motion.section>
    </main>
  );
}