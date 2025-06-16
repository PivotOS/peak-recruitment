"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

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

const VALID_USERNAME = "PeakRecruiter1";
const VALID_PASSWORD = "P!E@A#K$2026";

const CATEGORIES = [
  "Administrative & Office Support",
  "Customer Service & Call Center",
  "Healthcare & Medical",
  "Skilled Trades & Labor",
  "Manufacturing & Warehouse",
  "Education & Training",
  "Sales & Business Development",
  "Information Technology (IT)",
  "Finance & Accounting",
  "Human Resources",
  "Food Service & Hospitality",
  "Transportation & Logistics",
  "Construction & Maintenance",
  "Security & Public Safety",
  "Creative & Marketing",
  "Legal & Compliance",
  "Executive & Leadership",
  "Government & Public Sector",
  "Remote & Virtual Work",
];

function ErrorBoundary({ children }) {
  const [error, setError] = useState(null);
  useEffect(() => {
    const handleError = (err) => setError(err);
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);
  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2 className="text-xl font-bold">An error occurred: {error.message}</h2>
        <p>Please refresh the page or contact support.</p>
      </div>
    );
  }
  return children;
}

export default function ControlPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    salary: "",
    salaryRange: { min: "", max: "" },
    salaryType: "salary",
    location: "",
    jobType: "",
    deadline: "",
    category: "",
    shiftInfo: "",
    perks: "",
    meritMessage: "",
  });
  const [editingJob, setEditingJob] = useState(null);
  const [newApplicationAlert, setNewApplicationAlert] = useState(null);
  const [errors, setErrors] = useState({});
  const [filters, setFilters] = useState({ location: "", jobType: "", keywords: "" });
  const jobsRef = useRef(jobs);

  const handleLogin = useCallback((e) => {
    e.preventDefault();
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError("");
      setUsername("");
      setPassword("");
    } else {
      setLoginError("Invalid username or password.");
    }
  }, [username, password]);

  const validateJobForm = useCallback(() => {
    const newErrors = {};
    if (!newJob.title.trim()) newErrors.title = "Job title is required";
    if (!newJob.description.trim()) newErrors.description = "Description is required";
    if (newJob.salaryType === "salary" && !newJob.salary.trim()) {
      newErrors.salary = "Salary is required";
    } else if (newJob.salaryType === "range") {
      if (!newJob.salaryRange.min.trim()) newErrors.salaryRangeMin = "Minimum salary is required";
      if (!newJob.salaryRange.max.trim()) newErrors.salaryRangeMax = "Maximum salary is required";
    }
    if (!newJob.location.trim()) newErrors.location = "Location is required";
    if (!newJob.jobType) newErrors.jobType = "Job type is required";
    if (!newJob.deadline) newErrors.deadline = "Deadline is required";
    if (!newJob.category) newErrors.category = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [newJob]);

  const handleCreateJob = useCallback(async (e) => {
    e.preventDefault();
    if (!validateJobForm()) return;

    try {
      console.log("Creating job with data:", newJob);
      const jobData = {
        ...newJob,
        dateAdded: new Date().toISOString(),
        status: "open",
      };
      const docRef = await addDoc(collection(db, "jobs"), jobData);
      console.log("Job created with ID:", docRef.id);
      await addDoc(collection(db, "jobActions"), {
        action: "create",
        jobTitle: newJob.title,
        timestamp: new Date().toISOString(),
        user: VALID_USERNAME,
      });
      setNewJob({
        title: "",
        description: "",
        salary: "",
        salaryRange: { min: "", max: "" },
        salaryType: "salary",
        location: "",
        jobType: "",
        deadline: "",
        category: "",
        shiftInfo: "",
        perks: "",
        meritMessage: "",
      });
      setErrors({});
    } catch (err) {
      console.error("Error creating job:", err);
      alert("Failed to create job. Please try again.");
    }
  }, [newJob, validateJobForm]);

  const handleEditJob = useCallback(async (e) => {
    e.preventDefault();
    if (!validateJobForm()) return;

    try {
      console.log("Updating job ID:", editingJob.id, "with data:", newJob);
      await updateDoc(doc(db, "jobs", editingJob.id), {
        ...newJob,
        dateAdded: editingJob.dateAdded,
        status: editingJob.status,
      });
      await addDoc(collection(db, "jobActions"), {
        action: "edit",
        jobTitle: newJob.title,
        timestamp: new Date().toISOString(),
        user: VALID_USERNAME,
      });
      setEditingJob(null);
      setNewJob({
        title: "",
        description: "",
        salary: "",
        salaryRange: { min: "", max: "" },
        salaryType: "salary",
        location: "",
        jobType: "",
        deadline: "",
        category: "",
        shiftInfo: "",
        perks: "",
        meritMessage: "",
      });
      setErrors({});
    } catch (err) {
      console.error("Error updating job:", err);
      alert("Failed to update job. Please try again.");
    }
  }, [newJob, editingJob, validateJobForm]);

  const handleJobAction = useCallback(async (jobId, action) => {
    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error("Job not found");
      console.log(`Performing action ${action} on job ID:`, jobId);
      let status;
      switch (action) {
        case "open":
          status = "open";
          break;
        case "close":
          status = "closed";
          break;
        case "save":
          status = "saved";
          break;
        case "delete":
          await deleteDoc(doc(db, "jobs", jobId));
          await addDoc(collection(db, "jobActions"), {
            action: "delete",
            jobTitle: job.title,
            timestamp: new Date().toISOString(),
            user: VALID_USERNAME,
          });
          return;
        default:
          throw new Error("Invalid action");
      }

      await updateDoc(doc(db, "jobs", jobId), { status });
      await addDoc(collection(db, "jobActions"), {
        action,
        jobTitle: job.title,
        timestamp: new Date().toISOString(),
        user: VALID_USERNAME,
      });
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      alert(`Failed to ${action} job. Please try again.`);
    }
  }, [jobs]);

  const startEditing = useCallback((job) => {
    console.log("Starting edit for job:", job);
    setEditingJob(job);
    setNewJob({
      title: job.title || "",
      description: job.description || "",
      salary: job.salary || "",
      salaryRange: job.salaryRange || { min: "", max: "" },
      salaryType: job.salaryType || "salary",
      location: job.location || "",
      jobType: job.jobType || "",
      deadline: job.deadline ? job.deadline.split("T")[0] : "",
      category: job.category || "",
      shiftInfo: job.shiftInfo || "",
      perks: job.perks || "",
      meritMessage: job.meritMessage || "",
    });
  }, []);

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
    if (isAuthenticated) {
      const unsubscribeJobs = onSnapshot(collection(db, "jobs"), (snapshot) => {
        const jobList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        jobList.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        if (JSON.stringify(jobList) !== JSON.stringify(jobsRef.current)) {
          console.log("Fetched jobs:", jobList);
          setJobs(jobList);
          jobsRef.current = jobList;
        }
      }, (err) => {
        console.error("Error fetching jobs:", err);
        alert("Failed to load jobs.");
      });

      const unsubscribeApps = onSnapshot(collection(db, "preApps"), (snapshot) => {
        const appList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setApplications(prev => {
          const newApps = appList.filter(app => !prev.some(p => p.id === app.id));
          if (newApps.length > 0) {
            newApps.forEach(app => {
              const job = jobsRef.current.find(j => j.id === app.jobId) || { title: "Unknown Job" };
              setNewApplicationAlert({
                message: `New application from ${app.fullName} for ${job.title}`,
                timestamp: new Date().toISOString(),
              });
              setTimeout(() => setNewApplicationAlert(null), 5000);
            });
          }
          return appList;
        });
      }, (err) => {
        console.error("Error fetching applications:", err);
        alert("Failed to load applications.");
      });

      return () => {
        unsubscribeJobs();
        unsubscribeApps();
      };
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg max-w-md mx-auto mt-10"
          key="login-form"
        >
          <div className="text-center mb-6">
            <img src="/peaklogo.png" alt="Peak Logo" className="mx-auto max-w-[200px] h-auto" />
          </div>
          <h1 className="text-2xl text-center mb-4 text-gray-800">Recruiter Login</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block mb-2 text-gray-800" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-peak-gold rounded-lg text-base outline-none bg-white"
                aria-required="true"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-800" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-peak-gold rounded-lg text-base outline-none bg-white"
                aria-required="true"
              />
            </div>
            {loginError && (
              <p className="text-red-600 text-sm mb-4" role="alert">{loginError}</p>
            )}
            <div className="mb-4">
              <button
                type="submit"
                className="w-full p-3 bg-peak-gold text-white rounded-lg cursor-pointer hover:bg-yellow-600 text-base font-semibold"
                style={{ opacity: 1, backgroundColor: '#d4af37' }}
              >
                Login
              </button>
            </div>
          </form>
        </motion.div>
      </ErrorBoundary>
    );
  }

  console.log("Rendering Control Panel with jobs:", jobs.length);

  const isJobExpired = (deadline) => {
  const now = new Date();
  const expiration = new Date(deadline);
  if (deadline && expiration < now) {
    // Attempt to delete expired job from Firebase
    const jobToDelete = jobs.find(j => j.deadline === deadline);
    if (jobToDelete && jobToDelete.status !== "deleted") {
      handleJobAction(jobToDelete.id, "delete");
    }
  }
  return deadline && expiration < now;
};

  const filteredJobs = jobs.filter(applyFilter);

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg"
        key="control-panel"
      >
        <div className="text-center mb-6">
          <img src="/peaklogo.png" alt="Peak Logo" className="mx-auto max-w-[200px] h-auto" />
        </div>
        <h1 className="text-3xl text-center mb-6 text-gray-800">Recruiter Console</h1>

        <AnimatePresence>
          {newApplicationAlert && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-peak-gold text-white p-4 rounded-lg mb-4 text-center"
              key={newApplicationAlert.timestamp}
            >
              {newApplicationAlert.message}
            </motion.div>
          )}
        </AnimatePresence>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <section>
            <h2 className="text-2xl mb-4 text-gray-800">{editingJob ? "Edit Job Posting" : "Create New Job Posting"}</h2>
            {console.log("Rendering job form, editingJob:", !!editingJob)}
            <form onSubmit={editingJob ? handleEditJob : handleCreateJob}>
              <div className="mb-4">
                <label className="block mb-2 text-gray-800" htmlFor="title">Job Title</label>
                <input
                  id="title"
                  type="text"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full p-3 border border-peak-gold rounded-lg text-base outline-none bg-white"
                  aria-required="true"
                />
                {errors.title && <p className="text-red-600 text-sm mt-1" role="alert">{errors.title}</p>}
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-gray-800" htmlFor="location">Location (City, State)</label>
                <input
                  id="location"
                  type="text"
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  className="w-full p-3 border border-peak-gold rounded-lg text-base outline-none bg-white"
                  aria-required="true"
                  placeholder="e.g., New York, NY"
                />
                {errors.location && <p className="text-red-600 text-sm mt-1" role="alert">{errors.location}</p>}
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-gray-800">Compensation Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="salaryType"
                      value="salary"
                      checked={newJob.salaryType === "salary"}
                      onChange={() => setNewJob({ ...newJob, salaryType: "salary", salaryRange: { min: "", max: "" } })}
                      className="mr-2"
                    />
                    Single Salary
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="salaryType"
                      value="range"
                      checked={newJob.salaryType === "range"}
                      onChange={() => setNewJob({ ...newJob, salaryType: "range", salary: "" })}
                      className="mr-2"
                    />
                    Salary Range
                  </label>
                </div>
              </div>
              {newJob.salaryType === "salary" ? (
                <div className="mb-4">
                  <label className="block mb-2 text-gray-800" htmlFor="salary">Salary</label>
                  <input
                    id="salary"
                    type="text"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                    className="w-full p-3 border border-peak-gold rounded-lg text-base outline-none bg-white"
                    aria-required="true"
                    placeholder="e.g., $50,000"
                  />
                  {errors.salary && <p className="text-red-600 text-sm mt-1" role="alert">{errors.salary}</p>}
                </div>
              ) : (
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-gray-800" htmlFor="salaryRangeMin">Minimum Salary</label>
                    <input
                      id="salaryRangeMin"
                      type="text"
                      value={newJob.salaryRange.min}
                      onChange={(e) => setNewJob({ ...newJob, salaryRange: { ...newJob.salaryRange, min: e.target.value } })}
                      className="w-full p-3 border border-peak-gold rounded-lg text-base outline-none bg-white"
                      aria-required="true"
                      placeholder="e.g., $40,000"
                    />
                    {errors.salaryRangeMin && <p className="text-red-600 text-sm mt-1" role="alert">{errors.salaryRangeMin}</p>}
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-800" htmlFor="salaryRangeMax">Maximum Salary</label>
                    <input
                      id="salaryRangeMax"
                      type="text"
                      value={newJob.salaryRange.max}
                      onChange={(e) => setNewJob({ ...newJob, salaryRange: { ...newJob.salaryRange, max: e.target.value } })}
                      className="w-full p-3 border border-peak-gold rounded-lg text-base outline-none bg-white"
                      aria-required="true"
                      placeholder="e.g., $60,000"
                    />
                    {errors.salaryRangeMax && <p className="text-red-600 text-sm mt-1" role="alert">{errors.salaryRangeMax}</p>}
                  </div>
                </div>
              )}
              <div className="mb-4">
                <label className="block mb-2 text-gray-800" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  rows="4"
                  className="w-full p-3 border border-peak-gold rounded-lg text-base outline-none bg-white"
                  aria-required="true"
                />
                {errors.description && <p className="text-red-600 text-sm mt-1" role="alert">{errors.description}</p>}
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-gray-800" htmlFor="jobType">Job Type</label>
                <select
                  id="jobType"
                  value={newJob.jobType}
                  onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value })}
                  className="w-full p-3 border border-peak-gold rounded-lg text-base outline-none bg-white"
                  aria-required="true"
                >
                  <option value="">Select</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                  <option value="Temporary to Hire">Temporary to Hire</option>
                  <option value="Direct Hire">Direct Hire</option>
                </select>
                {errors.jobType && <p className="text-red-600 text-sm mt-1" role="alert">{errors.jobType}</p>}
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-gray-800" htmlFor="shiftInfo">Shift Information (Optional)</label>
                <input
                  id="shiftInfo"
                  type="text"
                  value={newJob.shiftInfo}
                  onChange={(e) => setNewJob({ ...newJob, shiftInfo: e.target.value })}
                  className="w-full p-3 border border-peak-gold rounded-lg text-base outline-none bg-white"
                  placeholder="e.g., Mon-Fri, 9-5"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-gray-800" htmlFor="deadline">Application Deadline</label>
                <input
                  id="deadline"
                  type="date"
                  value={newJob.deadline}
                  onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                  className="w-full p-3 border border-peak-gold rounded-lg text-base outline-none bg-white"
                  aria-required="true"
                />
                {errors.deadline && <p className="text-red-600 text-sm mt-1" role="alert">{errors.deadline}</p>}
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-gray-800" htmlFor="category">Category</label>
                <select
                  id="category"
                  value={newJob.category}
                  onChange={(e) => setNewJob({ ...newJob, category: e.target.value })}
                  className="w-full p-3 border border-peak-gold rounded-lg text-base outline-none bg-white"
                  aria-required="true"
                >
                  <option value="">Select</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-600 text-sm mt-1" role="alert">{errors.category}</p>}
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-gray-800" htmlFor="perks">Perks/Benefits (Optional)</label>
                <textarea
                  id="perks"
                  value={newJob.perks}
                  onChange={(e) => setNewJob({ ...newJob, perks: e.target.value })}
                  rows="4"
                  className="w-full p-3 border border-peak-gold rounded-lg text-base outline-none bg-white"
                  placeholder="e.g., Health insurance, 401(k), remote work"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-gray-800" htmlFor="meritMessage">Merit Message (Optional)</label>
                <input
                  id="meritMessage"
                  type="text"
                  value={newJob.meritMessage}
                  onChange={(e) => setNewJob({ ...newJob, meritMessage: e.target.value })}
                  className="w-full p-3 border border-peak-gold rounded-lg text-base outline-none bg-white"
                  placeholder="e.g., Before Day One readiness required. Peak hires that last."
                />
              </div>
              <div className="mb-4" style={{ display: 'block' }}>
                <button
                  type="submit"
                  className="p-3 bg-peak-gold text-white rounded-lg cursor-pointer hover:bg-yellow-600"
                  style={{ display: 'inline-block', opacity: 1, backgroundColor: '#d4af37' }}
                >
                  {editingJob ? "Update Job" : "Create Job"}
                </button>
                {editingJob && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingJob(null);
                      setNewJob({
                        title: "",
                        description: "",
                        salary: "",
                        salaryRange: { min: "", max: "" },
                        salaryType: "salary",
                        location: "",
                        jobType: "",
                        deadline: "",
                        category: "",
                        shiftInfo: "",
                        perks: "",
                        meritMessage: "",
                      });
                      setErrors({});
                    }}
                    className="p-3 bg-gray-600 text-white rounded-lg cursor-pointer hover:bg-gray-700 ml-4"
                    style={{ display: 'inline-block', opacity: 1 }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section>
            <h2 className="text-2xl mb-4 text-gray-800">Job Board</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredJobs.length === 0 ? (
                  <p className="text-gray-600 col-span-full">No jobs match your filters.</p>
                ) : (
                  filteredJobs.map(job => {
                    console.log("Rendering job:", job.id, job.title);
                    const expired = isJobExpired(job.deadline);
                    return (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-6 border border-peak-gold rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 ${expired ? 'opacity-50' : ''}`}
                      >
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{job.title || "Untitled Job"}</h3>
                        <p className="text-gray-600 mb-1">Location: {job.location || "Unknown"}</p>
                        <p className="text-gray-600 mb-1">
                          Compensation: {job.salaryType === "salary" 
                            ? job.salary || "Unknown" 
                            : `${job.salaryRange?.min || "Unknown"} - ${job.salaryRange?.max || "Unknown"}`}
                        </p>
                        <p className="text-gray-600 mb-1">Type: {job.jobType || "Unknown"}</p>
                        {job.shiftInfo && <p className="text-gray-600 mb-1">Shift: {job.shiftInfo}</p>}
                        <p className="text-gray-600 mb-1">Category: {job.category || "None"}</p>
                        <p className="text-gray-600 mb-1">Status: {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : "Unknown"}</p>
                        <p className="text-gray-600 mb-1">Posted: {job.dateAdded ? new Date(job.dateAdded).toLocaleDateString() : "Unknown"}</p>
                        <p className="text-gray-600 mb-2">Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : "Unknown"} {expired ? "(Expired)" : ""}</p>
                        {job.perks && <p className="text-gray-600 mb-1">Perks: {job.perks}</p>}
                        {job.meritMessage && <p className="text-blue-600 text-sm italic mb-2">{job.meritMessage}</p>}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => startEditing(job)}
                            className="p-2 bg-peak-gold text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200"
                            style={{ backgroundColor: '#d4af37' }}
                          >
                            Edit
                          </button>
                          {job.status !== "open" && !expired && (
                            <button
                              onClick={() => handleJobAction(job.id, "open")}
                              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                              Open
                            </button>
                          )}
                          {job.status !== "closed" && !expired && (
                            <button
                              onClick={() => handleJobAction(job.id, "close")}
                              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                            >
                              Close
                            </button>
                          )}
                          {job.status !== "saved" && !expired && (
                            <button
                              onClick={() => handleJobAction(job.id, "save")}
                              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                              Save
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${job.title || "Untitled Job"}"?`)) {
                                handleJobAction(job.id, "delete");
                              }
                            }}
                            className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        <section>
          <h2 className="text-2xl mb-4 text-gray-800">Applications</h2>
          <div className="grid gap-4">
            <AnimatePresence>
              {applications.length === 0 ? (
                <p className="text-gray-800">No applications available.</p>
              ) : (
                applications.map(app => {
                  const job = jobs.find(j => j.id === app.jobId) || { title: "Unknown Job" };
                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4 border border-peak-gold rounded-lg bg-white"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{app.fullName} - {job.title}</h3>
                      <p className="text-gray-800 mb-1">Email: {app.email || "Unknown"}</p>
                      <p className="text-gray-800 mb-1">Phone: {app.phone || "Unknown"}</p>
                      <p className="text-gray-800 mb-1">Submitted: {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "Unknown"}</p>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </section>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="mt-8 p-3 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 block ml-auto"
        >
          Logout
        </button>

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
    </ErrorBoundary>
  );
}