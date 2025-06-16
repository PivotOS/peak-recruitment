"use client";

import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import Link from "next/link";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
const [filters, setFilters] = useState({ location: "", jobType: "", keywords: "" });

const applyFilter = (job) => {
  const { location, jobType, keywords } = filters;
  const matchesLocation = !location || job.location.toLowerCase().includes(location.toLowerCase());
  const matchesJobType = !jobType || job.jobType === jobType;
  const matchesKeywords = !keywords || 
    (job.title.toLowerCase().includes(keywords.toLowerCase()) || 
     job.description.toLowerCase().includes(keywords.toLowerCase()));
  return matchesLocation && matchesJobType && matchesKeywords;
};

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsQuery = query(collection(db, "jobs"), where("status", "==", "open"));
        const querySnapshot = await getDocs(jobsQuery);
        const jobList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        jobList.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        setJobs(jobList);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };
    fetchJobs();
  }, []);

  const isJobExpired = (deadline) => {
    return deadline && new Date(deadline) < new Date();
  };

  return (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg"
  >
    <div className="text-center mb-6">
      <img src="/peaklogo.png" alt="Peak Logo" className="mx-auto max-w-[200px] h-auto" />
    </div>
    <h1 className="text-3xl text-center mb-6 text-gray-800">Peak Job Board</h1>
    <div className="mb-8">
      <h2 className="text-2xl mb-4 text-gray-800">Search & Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-2 text-gray-800" htmlFor="filter-location">Location</label>
          <input
            id="filter-location"
            type="text"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="w-full p-2 border border-peak-gold rounded-lg text-base outline-none bg-white"
            placeholder="e.g., Chicago, IL"
          />
        </div>
        <div>
          <label className="block mb-2 text-gray-800" htmlFor="filter-jobType">Job Type</label>
          <select
            id="filter-jobType"
            value={filters.jobType}
            onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
            className="w-full p-2 border border-peak-gold rounded-lg text-base outline-none bg-white"
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
          <label className="block mb-2 text-gray-800" htmlFor="filter-keywords">Keywords</label>
          <input
            id="filter-keywords"
            type="text"
            value={filters.keywords}
            onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
            className="w-full p-2 border border-peak-gold rounded-lg text-base outline-none bg-white"
            placeholder="e.g., IT, Sales"
          />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.length === 0 ? (
        <p className="text-gray-600 col-span-full text-center">No open job postings available.</p>
      ) : (
        jobs.filter(applyFilter).map(job => {
          const expired = isJobExpired(job.deadline);
          if (expired) return null;
          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 border border-peak-gold rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">{job.title || "Untitled Job"}</h2>
              <p className="text-gray-600 mb-1">Location: {job.location || "Unknown"}</p>
              <p className="text-gray-600 mb-1">
                Compensation: {job.salaryType === "salary" 
                  ? job.salary || "Unknown" 
                  : `${job.salaryRange?.min || "Unknown"} - ${job.salaryRange?.max || "Unknown"}`}
              </p>
              <p className="text-gray-600 mb-1">Type: {job.jobType || "Unknown"}</p>
              {job.shiftInfo && <p className="text-gray-600 mb-1">Shift: {job.shiftInfo}</p>}
              <p className="text-gray-600 mb-1">Category: {job.category || "None"}</p>
              <p className="text-gray-600 mb-1">Posted: {job.dateAdded ? new Date(job.dateAdded).toLocaleDateString() : "Unknown"}</p>
              <p className="text-gray-600 mb-2">Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : "Unknown"}</p>
              {job.perks && <p className="text-gray-600 mb-1">Perks: {job.perks}</p>}
              {job.meritMessage && <p className="text-blue-600 text-sm italic mb-2">{job.meritMessage}</p>}
              <Link
                href={`/preapp?jobId=${job.id}`}
                className="block w-full p-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Apply Now
              </Link>
            </motion.div>
          );
        })
      )}
    </div>
    <p className="mt-8 text-center text-gray-800 text-sm">
      Peak is an Equal Opportunity Employer. It is our policy to provide equal employment opportunity (EEO) to all persons
      regardless of age, color, national origin, citizenship status, physical or mental disability, race, religion, creed,
      gender, sex, sexual orientation, gender identity and/or expression, genetic information, marital status, status with
      regard to public assistance, veteran status, or any other characteristic protected by federal, state or local law.
    </p>
    <p className="text-center text-gray-800 text-sm mt-8">
      © {new Date().getFullYear()} PivotOS. All rights reserved.
    </p>
  </motion.div>
);
}