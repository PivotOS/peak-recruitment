"use client";

import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../../components/Logo";
import Toast, { useToast } from "../../components/Toast";

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

function FileButton({ url, label }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block px-3 py-1 bg-blue-100 rounded text-blue-800 text-xs font-semibold hover:underline mr-1"
      download
    >
      {label}
    </a>
  );
}

function exportCSV(applications, jobs) {
  const headers = [
    "Full Name",
    "Email",
    "Phone",
    "Job Title",
    "Submitted",
    "BD1 Score",
    "HPP",
    "Notes",
  ];
  const lines = [
    headers.join(","),
    ...applications.map((app) => {
      const job = jobs.find((j) => j.id === app.jobId) || { title: "" };
      return [
        `"${app.fullName || ""}"`,
        `"${app.email || ""}"`,
        `"${app.phone || ""}"`,
        `"${job.title || ""}"`,
        `"${app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : ""}"`,
        `"${app.bd1Score || ""}"`,
        `"${app.isHPP ? "Yes" : ""}"`,
        `"${app.recruiterNotes || ""}"`,
      ].join(",");
    }),
  ];
  const csv = lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `candidates-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
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
    jobType: "",
    deadline: "",
    category: "",
    location: "",
    shiftInfo: "",
    perks: "",
    meritMessage: "",
    compensationType: "", // "payRate" or "salary"
    payRate: "",
    salaryMin: "",
    salaryMax: "",
  });
  const [editingJob, setEditingJob] = useState(null);
  const [errors, setErrors] = useState({});
  const { showToast, ToastContainer } = useToast();
  const [modalApp, setModalApp] = useState(null);
  const [filter, setFilter] = useState({
    name: "",
    email: "",
    hpp: "",
    bd1min: "",
    bd1max: "",
  });
  const [confirm, setConfirm] = useState(null);

  // --- Authentication ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError("");
      setUsername("");
      setPassword("");
      showToast("Login successful.", "success");
    } else {
      setLoginError("Invalid username or password.");
      showToast("Invalid username or password.", "error");
    }
  };

  // --- Job Form Validation ---
  const validateJobForm = () => {
    const newErrors = {};
    if (!newJob.title.trim()) newErrors.title = "Job title is required";
    if (!newJob.description.trim()) newErrors.description = "Description is required";
    if (!newJob.salary.trim() && !newJob.payRate.trim() && !(newJob.salaryMin.trim() && newJob.salaryMax.trim())) newErrors.salary = "Salary or pay rate is required";
    if (!newJob.jobType) newErrors.jobType = "Job type is required";
    if (!newJob.deadline) newErrors.deadline = "Deadline is required";
    if (!newJob.category) newErrors.category = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Create Job ---
  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!validateJobForm()) return;
    try {
      const jobData = {
        ...newJob,
        dateAdded: new Date().toISOString(),
        status: "open",
      };
      await addDoc(collection(db, "jobs"), jobData);
      showToast("Job created.", "success");
      setNewJob({
        title: "",
        description: "",
        salary: "",
        jobType: "",
        deadline: "",
        category: "",
        location: "",
        shiftInfo: "",
        perks: "",
        meritMessage: "",
        compensationType: "",
        payRate: "",
        salaryMin: "",
        salaryMax: "",
      });
      setErrors({});
    } catch (err) {
      showToast("Failed to create job.", "error");
    }
  };

  // --- Edit Job ---
  const handleEditJob = async (e) => {
    e.preventDefault();
    if (!validateJobForm()) return;
    try {
      await updateDoc(doc(db, "jobs", editingJob.id), {
        ...newJob,
        dateAdded: editingJob.dateAdded,
        status: editingJob.status,
      });
      showToast("Job updated.", "success");
      setEditingJob(null);
      setNewJob({
        title: "",
        description: "",
        salary: "",
        jobType: "",
        deadline: "",
        category: "",
        location: "",
        shiftInfo: "",
        perks: "",
        meritMessage: "",
        compensationType: "",
        payRate: "",
        salaryMin: "",
        salaryMax: "",
      });
      setErrors({});
    } catch (err) {
      showToast("Failed to update job.", "error");
    }
  };

  // --- Job Status Actions ---
  const handleJobAction = async (jobId, action) => {
    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error("Job not found");
      let status;
      switch (action) {
        case "open":
          status = "open";
          break;
        case "close":
          status = "closed";
          break;
        case "delete":
          await deleteDoc(doc(db, "jobs", jobId));
          showToast("Job deleted.", "success");
          return;
        default:
          throw new Error("Invalid action");
      }
      await updateDoc(doc(db, "jobs", jobId), { status });
      showToast(`Job ${action}d.`, "success");
    } catch (err) {
      showToast(`Failed to ${action} job.`, "error");
    }
  };

  // --- Start Editing Job ---
  const startEditing = (job) => {
    setEditingJob(job);
    setNewJob({
      title: job.title,
      description: job.description,
      salary: job.salary,
      jobType: job.jobType,
      deadline: job.deadline ? job.deadline.split("T")[0] : "",
      category: job.category || "",
      location: job.location || "",
      shiftInfo: job.shiftInfo || "",
      perks: job.perks || "",
      meritMessage: job.meritMessage || "",
      compensationType: job.compensationType || "",
      payRate: job.payRate || "",
      salaryMin: job.salaryMin || "",
      salaryMax: job.salaryMax || "",
    });
  };

  // --- Toggle HPP status with confirmation ---
  const toggleHPP = (app) => {
    setConfirm({
      action: app.isHPP ? "Unmark HPP" : "Mark HPP",
      data: app,
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, "preApps", app.id), { isHPP: !app.isHPP });
          showToast(app.isHPP ? "Removed HPP tag." : "Marked as HPP.", "success");
        } catch {
          showToast("Could not update HPP status.", "error");
        }
        setConfirm(null);
      },
    });
  };

  // --- Save Notes ---
  const saveNotes = async (appId, newValue) => {
    try {
      await updateDoc(doc(db, "preApps", appId), { recruiterNotes: newValue });
      showToast("Notes saved.", "success");
    } catch {
      showToast("Could not save notes.", "error");
    }
  };

  // --- Data Listeners ---
  useEffect(() => {
    if (isAuthenticated) {
      const unsubscribeJobs = onSnapshot(collection(db, "jobs"), (snapshot) => {
        const jobList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        jobList.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        setJobs(jobList);
      });
      const unsubscribeApps = onSnapshot(collection(db, "preApps"), (snapshot) => {
        const appList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setApplications(appList);
      });
      return () => {
        unsubscribeJobs();
        unsubscribeApps();
      };
    }
  }, [isAuthenticated]);

  // --- Filtered Applications ---
  const filteredApps = applications.filter((app) => {
    const job = jobs.find((j) => j.id === app.jobId) || {};
    return (
      (!filter.name || (app.fullName || "").toLowerCase().includes(filter.name.toLowerCase())) &&
      (!filter.email || (app.email || "").toLowerCase().includes(filter.email.toLowerCase())) &&
      (!filter.hpp || (filter.hpp === "yes" ? app.isHPP : !app.isHPP)) &&
      (!filter.bd1min || (app.bd1Score >= parseInt(filter.bd1min))) &&
      (!filter.bd1max || (app.bd1Score <= parseInt(filter.bd1max)))
    );
  });

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-md mx-auto mt-10"
          key="login-form"
        >
          <div className="text-center mb-8">
            <Logo className="mx-auto w-[260px] h-auto" />
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
            <button
              type="submit"
              className="w-full p-3 bg-peak-gold text-white rounded-lg cursor-pointer hover:bg-yellow-600 text-base font-semibold"
            >
              Login
            </button>
          </form>
          <ToastContainer />
        </motion.div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-7xl mx-auto my-12"
        key="control-panel"
      >
        <div className="text-center mb-8">
          <Logo className="mx-auto w-[400px] h-auto" />
        </div>
        <h1 className="text-3xl text-center mb-8 text-peak-blue font-bold tracking-tight">Recruiter Console</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Create/Edit Job Posting */}
          <section className="bg-white border border-yellow-300 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl mb-4 text-peak-blue font-semibold">{editingJob ? "Edit Job Posting" : "Create New Job Posting"}</h2>
            <form onSubmit={editingJob ? handleEditJob : handleCreateJob}>
              <div className="mb-2">
                <label className="block mb-1 font-semibold">Job Title</label>
                <input type="text" className="w-full border p-2 rounded" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} required />
                {errors.title && <div className="text-red-600 text-sm">{errors.title}</div>}
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-semibold">Description</label>
                <textarea className="w-full border p-2 rounded" value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} required />
                {errors.description && <div className="text-red-600 text-sm">{errors.description}</div>}
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-semibold">Location</label>
                <input type="text" className="w-full border p-2 rounded" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-semibold">Job Type</label>
                <select className="w-full border p-2 rounded" value={newJob.jobType} onChange={e => setNewJob({ ...newJob, jobType: e.target.value })} required>
                  <option value="">Select</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                  <option value="Temporary to Hire">Temporary to Hire</option>
                  <option value="Direct Hire">Direct Hire</option>
                </select>
                {errors.jobType && <div className="text-red-600 text-sm">{errors.jobType}</div>}
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-semibold">Category</label>
                <select className="w-full border p-2 rounded" value={newJob.category} onChange={e => setNewJob({ ...newJob, category: e.target.value })} required>
                  <option value="">Select</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <div className="text-red-600 text-sm">{errors.category}</div>}
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-semibold">Deadline</label>
                <input type="date" className="w-full border p-2 rounded" value={newJob.deadline} onChange={e => setNewJob({ ...newJob, deadline: e.target.value })} required />
                {errors.deadline && <div className="text-red-600 text-sm">{errors.deadline}</div>}
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-semibold">Salary</label>
                <input type="text" className="w-full border p-2 rounded" value={newJob.salary} onChange={e => setNewJob({ ...newJob, salary: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-semibold">Pay Rate</label>
                <input type="text" className="w-full border p-2 rounded" value={newJob.payRate} onChange={e => setNewJob({ ...newJob, payRate: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-semibold">Salary Min</label>
                <input type="text" className="w-full border p-2 rounded" value={newJob.salaryMin} onChange={e => setNewJob({ ...newJob, salaryMin: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-semibold">Salary Max</label>
                <input type="text" className="w-full border p-2 rounded" value={newJob.salaryMax} onChange={e => setNewJob({ ...newJob, salaryMax: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-semibold">Shift Info</label>
                <input type="text" className="w-full border p-2 rounded" value={newJob.shiftInfo} onChange={e => setNewJob({ ...newJob, shiftInfo: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-semibold">Perks</label>
                <input type="text" className="w-full border p-2 rounded" value={newJob.perks} onChange={e => setNewJob({ ...newJob, perks: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-semibold">Merit Message</label>
                <input type="text" className="w-full border p-2 rounded" value={newJob.meritMessage} onChange={e => setNewJob({ ...newJob, meritMessage: e.target.value })} />
              </div>
              <button type="submit" className="w-full p-3 mt-4 bg-peak-gold text-white rounded-lg font-semibold hover:bg-yellow-600">
                {editingJob ? "Update Job" : "Create Job"}
              </button>
              {editingJob && (
                <button type="button" className="w-full p-3 mt-2 bg-gray-300 rounded-lg font-semibold" onClick={() => setEditingJob(null)}>
                  Cancel
                </button>
              )}
            </form>
          </section>
          {/* Job Postings */}
          <section className="bg-white border border-yellow-300 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl mb-4 text-peak-blue font-semibold">Job Postings</h2>
            <div className="grid gap-4">
              <AnimatePresence>
                {jobs.map(job => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 border border-peak-gold rounded-lg bg-white shadow"
                  >
                    <h3 className="text-lg font-bold">{job.title}</h3>
                    <p>{job.description}</p>
                    <p className="text-sm text-gray-700">Type: {job.jobType} | Category: {job.category} | Deadline: {job.deadline} | Status: {job.status}</p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => startEditing(job)} className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">Edit</button>
                      <button onClick={() => handleJobAction(job.id, "close")} className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-xs font-semibold">Close</button>
                      <button onClick={() => handleJobAction(job.id, "open")} className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">Open</button>
                      <button onClick={() => handleJobAction(job.id, "delete")} className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">Delete</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>
        {/* Candidate Filtering & Export */}
        <section className="mb-6 bg-white border border-yellow-300 rounded-2xl p-6 shadow">
          <div className="flex flex-wrap gap-4 items-end mb-2">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={filter.name}
                onChange={e => setFilter(f => ({ ...f, name: e.target.value }))}
                className="p-2 border border-yellow-400 rounded"
                placeholder="Candidate name"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                type="text"
                value={filter.email}
                onChange={e => setFilter(f => ({ ...f, email: e.target.value }))}
                className="p-2 border border-yellow-400 rounded"
                placeholder="Email"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">HPP</label>
              <select
                value={filter.hpp}
                onChange={e => setFilter(f => ({ ...f, hpp: e.target.value }))}
                className="p-2 border border-yellow-400 rounded"
              >
                <option value="">All</option>
                <option value="yes">HPP Only</option>
                <option value="no">Not HPP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">BD1 Score Min</label>
              <input
                type="number"
                min={0}
                max={8}
                value={filter.bd1min}
                onChange={e => setFilter(f => ({ ...f, bd1min: e.target.value }))}
                className="p-2 border border-yellow-400 rounded w-24"
                placeholder="Min"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">BD1 Score Max</label>
              <input
                type="number"
                min={0}
                max={8}
                value={filter.bd1max}
                onChange={e => setFilter(f => ({ ...f, bd1max: e.target.value }))}
                className="p-2 border border-yellow-400 rounded w-24"
                placeholder="Max"
              />
            </div>
            <button
              onClick={() => exportCSV(filteredApps, jobs)}
              className="ml-auto mt-3 px-4 py-2 bg-peak-gold text-white rounded hover:bg-yellow-600"
              type="button"
            >
              Export CSV
            </button>
          </div>
        </section>
        {/* Applications */}
        <section className="bg-white border border-yellow-300 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl mb-4 text-peak-blue font-semibold">Applications</h2>
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredApps.map(app => {
                const job = jobs.find(j => j.id === app.jobId) || { title: "Unknown Job" };
                const bd1Max = 8;
                const gold = app.bd1Score >= 7;
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 border-2 rounded-lg bg-white shadow flex flex-col md:flex-row md:items-center md:justify-between ${
                      app.isHPP ? "border-yellow-400 bg-yellow-50" : "border-peak-gold"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 cursor-pointer hover:underline" onClick={() => setModalApp(app)}>
                          {app.fullName} - {job.title}
                        </h3>
                        <span title={gold ? "High BD1 Score" : "BD1 Score"}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={gold ? "#FFD700" : "#D1D5DB"} width={24} height={24} className="inline">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
                          </svg>
                        </span>
                        {app.isHPP && (
                          <span className="ml-2 px-2 py-1 bg-yellow-400 text-white text-xs rounded font-semibold">
                            HPP
                          </span>
                        )}
                      </div>
                      <p className="text-gray-800 mb-1">Email: {app.email}</p>
                      <p className="text-gray-800 mb-1">Phone: {app.phone}</p>
                      <p className="text-gray-800 mb-1">Submitted: {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : ""}</p>
                      <p className="text-gray-800 mb-1">
                        BD1 Score: <span className={gold ? "font-bold text-yellow-600" : ""}>{app.bd1Score || "N/A"}/{bd1Max}</span>
                      </p>
                      <div className="flex gap-2 mt-1 mb-1">
                        <FileButton url={app.resume} label="Resume" />
                        <FileButton url={app.educationProof} label="Education Proof" />
                      </div>
                      <label className="block text-xs text-gray-600 mt-2 mb-1">Recruiter Notes:</label>
                      <textarea
                        className="w-full p-2 border border-yellow-300 rounded text-sm mb-2"
                        placeholder="Add recruiter-only notes"
                        defaultValue={app.recruiterNotes || ""}
                        onBlur={e => saveNotes(app.id, e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2 mt-4 md:mt-0 md:ml-4">
                      <button
                        onClick={() => toggleHPP(app)}
                        className={`px-3 py-1 rounded font-semibold border ${
                          app.isHPP
                            ? "bg-yellow-400 text-white border-yellow-400"
                            : "bg-gray-100 border-yellow-400 text-yellow-700 hover:bg-yellow-200"
                        }`}
                      >
                        {app.isHPP ? "Unmark HPP" : "Mark HPP"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>
        {/* Candidate Modal */}
        <AnimatePresence>
          {modalApp && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalApp(null)}
            >
              <motion.div
                className="relative bg-white p-8 rounded-xl shadow-xl max-w-2xl w-full"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={e => e.stopPropagation()}
              >
                <button className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl font-bold" onClick={() => setModalApp(null)}>&times;</button>
                <h2 className="text-2xl font-bold mb-2">{modalApp.fullName}</h2>
                <p className="text-gray-700 mb-1"><span className="font-semibold">Email:</span> {modalApp.email}</p>
                <p className="text-gray-700 mb-1"><span className="font-semibold">Phone:</span> {modalApp.phone}</p>
                <p className="text-gray-700 mb-1"><span className="font-semibold">Submitted:</span> {modalApp.submittedAt ? new Date(modalApp.submittedAt).toLocaleDateString() : ""}</p>
                <p className="text-gray-700 mb-1"><span className="font-semibold">BD1 Score:</span> {modalApp.bd1Score}/8</p>
                <p className="text-gray-700 mb-1"><span className="font-semibold">HPP:</span> {modalApp.isHPP ? "Yes" : "No"}</p>
                <p className="text-gray-700 mb-1"><span className="font-semibold">Recruiter Notes:</span> {modalApp.recruiterNotes || "-"} </p>
                <div className="flex gap-2 my-2">
                  <FileButton url={modalApp.resume} label="Resume" />
                  <FileButton url={modalApp.educationProof} label="Education Proof" />
                </div>
                {modalApp.candidate_references && (
                  <>
                    <p className="font-semibold mt-3">References:</p>
                    <ul className="list-disc ml-5">
                      {modalApp.candidate_references.map((ref, i) => (
                        <li key={i} className="text-gray-700 text-sm">{ref.name} ({ref.relationship}), {ref.phone}, {ref.email}</li>
                      ))}
                    </ul>
                  </>
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    className="px-4 py-2 bg-peak-gold text-white rounded hover:bg-yellow-600"
                    onClick={() => setModalApp(null)}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Confirmation Dialog */}
        <AnimatePresence>
          {confirm && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirm(null)}
            >
              <motion.div
                className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full relative"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold mb-2">Are you sure?</h2>
                <p className="mb-4">Do you want to {confirm.action}?</p>
                <div className="flex justify-end gap-3">
                  <button className="px-4 py-2 rounded bg-gray-300 text-gray-800" onClick={() => setConfirm(null)}>
                    Cancel
                  </button>
                  <button className="px-4 py-2 rounded bg-peak-gold text-white" onClick={confirm.onConfirm}>
                    Yes, {confirm.action}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="mt-10 p-3 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 block ml-auto"
        >
          Logout
        </button>
        <footer className="mt-10 pt-8 border-t border-yellow-200 text-center text-gray-700 text-sm">
          <p className="font-semibold mb-2">Peak is an Equal Opportunity Employer.</p>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} PivotOS. All rights reserved.
          </p>
        </footer>
        <ToastContainer />
      </motion.div>
    </ErrorBoundary>
  );
}