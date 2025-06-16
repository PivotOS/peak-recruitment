"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

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

export default function ControlPanel() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const validateCredentials = (user, pass) => user === "PeakRecruiter1" && pass === "P!E@A#K$2026";

  const handleLogin = () => {
    if (validateCredentials(username, password)) {
      setIsAuthenticated(true);
    } else {
      setError("Invalid credentials");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribeJobs = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const jobList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setJobs(jobList);
    }, (err) => setError(err.message));

    const unsubscribeApps = onSnapshot(collection(db, "applications"), (snapshot) => {
      const appList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), flagged: false }));
      setApplications(appList);
    }, (err) => setError(err.message));

    setIsLoading(false);
    return () => {
      unsubscribeJobs();
      unsubscribeApps();
    };
  }, [isAuthenticated]);

  const handleJobAction = useCallback(async (jobId, action) => {
    const jobRef = doc(db, "jobs", jobId);
    if (action === "delete") {
      await deleteDoc(jobRef);
    } else {
      await updateDoc(jobRef, { status: action });
    }
  }, []);

  const handleApplicationDelete = useCallback(async (appId) => {
    const appRef = doc(db, "applications", appId);
    await deleteDoc(appRef);
    setApplications(applications.filter((app) => app.id !== appId));
  }, [applications]);

  const handleApplicationFlag = useCallback(async (appId) => {
    const appRef = doc(db, "applications", appId);
    const app = applications.find((a) => a.id === appId);
    const newFlagged = !app.flagged;
    await updateDoc(appRef, { flagged: newFlagged });
    setApplications(applications.map((a) => a.id === appId ? { ...a, flagged: newFlagged } : a));
  }, [applications]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 p-8 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-gray-800 text-center">Recruiter Login</h1>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleLogin}
            className="w-full p-2 bg-peak-gold text-white rounded-lg hover:bg-yellow-600"
          >
            Login
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-white to-gray-50 p-8"
    >
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Recruiter Control Panel</h1>
      <div className="mb-6">
        <h2 className="text-2xl mb-4 text-gray-800">Job Board</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6 border border-peak-gold rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">{job.title || "Untitled Job"}</h3>
              <p className="text-gray-600 mb-1">Location: {job.location || "Unknown"}</p>
              <p className="text-gray-600 mb-1">Status: {job.status || "Open"}</p>
              <div className="mt-4 space-x-2">
                <button
                  onClick={() => handleJobAction(job.id, "open")}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={job.status === "open"}
                >
                  Open
                </button>
                <button
                  onClick={() => handleJobAction(job.id, "closed")}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  disabled={job.status === "closed"}
                >
                  Close
                </button>
                <button
                  onClick={() => handleJobAction(job.id, "delete")}
                  className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-2xl mb-4 text-gray-800">Applications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-6 border rounded-xl shadow-lg ${app.flagged ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 bg-white'}`}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">{app.fullName || "Unnamed Applicant"}</h3>
              <p className="text-gray-600 mb-1">Email: {app.email || "No email"}</p>
              <p className="text-gray-600 mb-1">Job: {app.jobId || "No job"}</p>
              <div className="mt-4 space-x-2">
                <button
                  onClick={() => handleApplicationFlag(app.id)}
                  className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  {app.flagged ? 'Unflag' : 'Flag for Contact'}
                </button>
                <button
                  onClick={() => handleApplicationDelete(app.id)}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <p className="mt-8 text-center text-gray-800 text-sm">
        © {new Date().getFullYear()} PivotOS. All rights reserved.
      </p>
    </motion.div>
  );
}