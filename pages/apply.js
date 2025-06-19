"use client";

import { useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
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

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const bd1Questions = [
  {
    id: "bd1_q1",
    question: "What time do you arrive for an 8:00 AM shift?",
    options: shuffleArray([
      "7:45 AM — I like to be early and ready.",
      "8:00 AM — Right on time means I’m on time.",
      "8:05 AM — A few minutes late isn’t a big deal.",
      "Depends — I show up when I can.",
    ]),
  },
  {
    id: "bd1_q2",
    question: "Your supervisor gives you feedback on your work. How do you respond?",
    options: shuffleArray([
      "I reflect and use it to improve.",
      "I explain why I did it that way.",
      "I get defensive but eventually adjust.",
      "I ignore it—nobody’s perfect.",
    ]),
  },
  {
    id: "bd1_q3",
    question: "What shows you’re dependable at work?",
    options: shuffleArray([
      "Showing up early and ready every day.",
      "Doing my best when I’m there.",
      "Being available when I feel like it.",
      "Trying not to get fired.",
    ]),
  },
  {
    id: "bd1_q4",
    question: "Extra tasks pop up that aren’t your job. What do you do?",
    options: shuffleArray([
      "I jump in and help—it’s all part of the job.",
      "I do them if someone tells me to.",
      "I usually avoid them.",
      "I don’t do extra without extra pay.",
    ]),
  },
  {
    id: "bd1_q5",
    question: "A coworker is struggling with their workload. What do you do?",
    options: shuffleArray([
      "Help them without being asked.",
      "Wait to see if they ask for help.",
      "Tell a supervisor—it’s not my job.",
      "Ignore it—it’s their problem.",
    ]),
  },
  {
    id: "bd1_q6",
    question: "You make a mistake at work. What’s your next step?",
    options: shuffleArray([
      "Admit it, fix it, and learn from it.",
      "Wait to see if anyone notices.",
      "Cover it up if I can.",
      "Blame the process or someone else.",
    ]),
  },
  {
    id: "bd1_q7",
    question: "It’s a tough day, and the work feels repetitive. How do you handle it?",
    options: shuffleArray([
      "I stay focused—it still needs to get done.",
      "I do them, but I take frequent breaks.",
      "I rush through them to get them over with.",
      "I avoid them if I can.",
    ]),
  },
  {
    id: "bd1_q8",
    question: "You’re assigned a small, unglamorous task. How do you approach it?",
    options: shuffleArray([
      "I give full effort no matter the job.",
      "I do what I’m paid to do, no more.",
      "I work hard when I’m in the mood.",
      "I only work hard if I see a reward.",
    ]),
  },
];

export default function Home() {
  const [step, setStep] = useState(0);
  const [videoWatched, setVideoWatched] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    dateAvailable: "",
    workAuthorization: "",
    reliableTransportation: "",
    isAdult: "",
    validID: "",
    currentlyEmployed: "",
    noticeRequired: "",
    availabilityDays: [],
    earliestStartTime: "",
    latestEndTime: "",
    overnightAvailability: "",
    overtimeAvailability: "",
    unavailableHours: "",
    employmentType: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    highestEducation: "",
    educationProof: null,
    resume: null,
    candidate_references: [
      { name: "", relationship: "", phone: "", email: "" },
      { name: "", relationship: "", phone: "", email: "" },
      { name: "", relationship: "", phone: "", email: "" },
    ],
    bd1_q1: "",
    bd1_q2: "",
    bd1_q3: "",
    bd1_q4: "",
    bd1_q5: "",
    bd1_q6: "",
    bd1_q7: "",
    bd1_q8: "",
    agreeToTerms: false,
    jobId: "",
    jobTitle: "",
  });
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const searchParams = useSearchParams();

  useState(() => {
    const jobId = searchParams.get("jobId") || "";
    const jobTitle = searchParams.get("jobTitle") || "";
    setFormData((prev) => ({ ...prev, jobId, jobTitle }));
  }, [searchParams]);

  const handleVideoEnd = () => {
    setVideoWatched(true);
    setStep(1);
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.streetAddress.trim()) newErrors.streetAddress = "Street address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.zipCode.trim()) newErrors.zipCode = "Zip code is required";
      if (!formData.dateAvailable) newErrors.dateAvailable = "Start date is required";
      if (!formData.workAuthorization) newErrors.workAuthorization = "Work authorization is required";
      if (!formData.reliableTransportation) newErrors.reliableTransportation = "Transportation status is required";
      if (!formData.isAdult) newErrors.isAdult = "Age confirmation is required";
      if (!formData.validID) newErrors.validID = "ID confirmation is required";
      if (!formData.currentlyEmployed) newErrors.currentlyEmployed = "Employment status is required";
      if (formData.currentlyEmployed === "Yes" && !formData.noticeRequired) newErrors.noticeRequired = "Notice requirement is required";
    } else if (step === 2) {
      if (formData.availabilityDays.length === 0) newErrors.availabilityDays = "Select at least one day";
      if (!formData.earliestStartTime) newErrors.earliestStartTime = "Start time is required";
      if (!formData.latestEndTime) newErrors.latestEndTime = "End time is required";
      if (!formData.overnightAvailability) newErrors.overnightAvailability = "Overnight availability is required";
      if (!formData.overtimeAvailability) newErrors.overtimeAvailability = "Overtime availability is required";
      if (!formData.employmentType) newErrors.employmentType = "Employment type is required";
    } else if (step === 3) {
      if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = "Emergency contact name is required";
      if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = "Emergency contact phone is required";
      if (!formData.emergencyContactRelationship.trim()) newErrors.emergencyContactRelationship = "Relationship is required";
      if (!formData.highestEducation) newErrors.highestEducation = "Education level is required";
      formData.candidate_references.forEach((ref, index) => {
        if (!ref.name.trim()) newErrors[`ref${index}Name`] = `Reference ${index + 1} name is required`;
        if (!ref.relationship.trim()) newErrors[`ref${index}Relationship`] = `Reference ${index + 1} relationship is required`;
        if (!ref.phone.trim()) newErrors[`ref${index}Phone`] = `Reference ${index + 1} phone is required`;
        if (!ref.email.trim() || !/\S+@\S+\.\S+/.test(ref.email)) newErrors[`ref${index}Email`] = `Reference ${index + 1} email is invalid`;
      });
    } else if (step === 4) {
      if (!formData.bd1_q1) newErrors.bd1_q1 = "Please answer this question";
      if (!formData.bd1_q2) newErrors.bd1_q2 = "Please answer this question";
      if (!formData.bd1_q3) newErrors.bd1_q3 = "Please answer this question";
      if (!formData.bd1_q4) newErrors.bd1_q4 = "Please answer this question";
      if (!formData.bd1_q5) newErrors.bd1_q5 = "Please answer this question";
      if (!formData.bd1_q6) newErrors.bd1_q6 = "Please answer this question";
      if (!formData.bd1_q7) newErrors.bd1_q7 = "Please answer this question";
      if (!formData.bd1_q8) newErrors.bd1_q8 = "Please answer this question";
      if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the Terms of Use and Privacy Policy";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    if (type === "checkbox" && name === "availabilityDays") {
      setFormData((prev) => ({
        ...prev,
        availabilityDays: checked
          ? [...prev.availabilityDays, value]
          : prev.availabilityDays.filter((day) => day !== value),
      }));
    } else if (type === "checkbox" && name === "agreeToTerms") {
      setFormData((prev) => ({
        ...prev,
        agreeToTerms: checked,
      }));
    } else if (name.startsWith("ref")) {
      const [_, index, field] = name.match(/ref(\d)(.*)/);
      const fieldName = field.toLowerCase() === "name" ? "name" : field.toLowerCase() === "relationship" ? "relationship" : field.toLowerCase();
      setFormData((prev) => ({
        ...prev,
        candidate_references: prev.candidate_references.map((ref, i) =>
          i === parseInt(index) ? { ...ref, [fieldName]: value } : ref
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "file" ? files[0] : value,
      }));
    }
  };

  const calculateBD1Score = () => {
    const scores = {
      "7:45 AM — I like to be early and ready.": 5,
      "8:00 AM — Right on time means I’m on time.": 4,
      "8:05 AM — A few minutes late isn’t a big deal.": 2,
      "Depends — I show up when I can.": 1,
      "I reflect and use it to improve.": 5,
      "I explain why I did it that way.": 3,
      "I get defensive but eventually adjust.": 2,
      "I ignore it—nobody’s perfect.": 1,
      "Showing up early and ready every day.": 5,
      "Doing my best when I’m there.": 3,
      "Being available when I feel like it.": 2,
      "Trying not to get fired.": 1,
      "I jump in and help—it’s all part of the job.": 5,
      "I do them if someone tells me to.": 3,
      "I usually avoid them.": 2,
      "I don’t do extra without extra pay.": 1,
      "Help them without being asked.": 5,
      "Wait to see if they ask for help.": 3,
      "Tell a supervisor—it’s not my job.": 2,
      "Ignore it—it’s their problem.": 1,
      "Admit it, fix it, and learn from it.": 5,
      "Wait to see if anyone notices.": 3,
      "Cover it up if I can.": 2,
      "Blame the process or someone else.": 1,
      "I stay focused—it still needs to get done.": 5,
      "I do them, but I take frequent breaks.": 3,
      "I rush through them to get them over with.": 2,
      "I avoid them if I can.": 1,
      "I give full effort no matter the job.": 5,
      "I do what I’m paid to do, no more.": 3,
      "I work hard when I’m in the mood.": 2,
      "I only work hard if I see a reward.": 1,
    };
    const total = [
      formData.bd1_q1,
      formData.bd1_q2,
      formData.bd1_q3,
      formData.bd1_q4,
      formData.bd1_q5,
      formData.bd1_q6,
      formData.bd1_q7,
      formData.bd1_q8,
    ].reduce((sum, key) => sum + (scores[key] || 0), 0);
    return total;
  };

  const getBD1Recommendations = (score) => {
    if (score >= 35) return "Highly recommended for immediate consideration.";
    if (score >= 25) return "Recommended with minor coaching on workplace habits.";
    if (score >= 15) return "Consider with targeted training on dependability and teamwork.";
    return "Not recommended without significant improvement in work ethic.";
  };

  const getApplicantSuggestions = (score) => {
    if (score >= 35) return "Continue showcasing your strong work ethic and punctuality.";
    if (score >= 25) return "Focus on consistency in punctuality and proactive teamwork.";
    if (score >= 15) return "Work on dependability and openness to feedback for better performance.";
    return "Seek training in time management and workplace responsibility.";
  };

  const handleSubmit = async () => {
    if (validateStep()) {
      try {
        const bd1Score = calculateBD1Score();
        if (typeof bd1Score !== "number" || isNaN(bd1Score)) {
          console.error("Invalid BD1 Score:", bd1Score);
          throw new Error("Invalid BD1 score calculated");
        }
        const bd1Recommendations = getBD1Recommendations(bd1Score);
        const applicantSuggestions = getApplicantSuggestions(bd1Score);
        const { resume, educationProof, availabilityDays, agreeToTerms, ...data } = formData;
        await addDoc(collection(db, "candidates"), {
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          street_address: data.streetAddress,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          date_available: data.dateAvailable,
          work_authorization: data.workAuthorization,
          reliable_transportation: data.reliableTransportation,
          is_adult: data.isAdult,
          valid_id: data.validID,
          currently_employed: data.currentlyEmployed,
          notice_required: data.noticeRequired,
          availability_days: availabilityDays.join(", "),
          earliest_start_time: data.earliestStartTime,
          latest_end_time: data.latestEndTime,
          overnight_availability: data.overnightAvailability,
          overtime_availability: data.overtimeAvailability,
          unavailable_hours: data.unavailableHours,
          employment_type: data.employmentType,
          emergency_contact_name: data.emergencyContactName,
          emergency_contact_phone: data.emergencyContactPhone,
          emergency_contact_relationship: data.emergencyContactRelationship,
          highest_education: data.highestEducation,
          education_proof: educationProof ? educationProof.name : null,
          resume: resume ? resume.name : null,
          candidate_references: formData.candidate_references,
          bd1_q1: data.bd1_q1,
          bd1_q2: data.bd1_q2,
          bd1_q3: data.bd1_q3,
          bd1_q4: data.bd1_q4,
          bd1_q5: data.bd1_q5,
          bd1_q6: data.bd1_q6,
          bd1_q7: data.bd1_q7,
          bd1_q8: data.bd1_q8,
          bd1_score: bd1Score,
          bd1_recommendations: bd1Recommendations,
          applicant_suggestions: applicantSuggestions,
          job_id: data.jobId,
          job_title: data.jobTitle,
          submitted_at: new Date().toISOString(),
          status: "new",
          notes: "",
        });
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: data.fullName,
            email: data.email,
            jobTitle: data.jobTitle || "General Application",
          }),
        });
        router.push(`/thankyoupage?suggestions=${encodeURIComponent(applicantSuggestions)}&score=${bd1Score}`);
      } catch (error) {
        console.error("Submission error:", error.message);
        alert("Error submitting application: " + error.message);
      }
    } else {
      console.log("Validation failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6 sm:p-8 bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-2xl min-h-screen"
      role="main"
    >
      {step === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">
              Welcome to the Pre-Application
            </h1>
            <p className="mb-4 text-gray-600 text-base sm:text-lg">
              ➤ Before you begin, please watch the video to the right. →
            </p>
            <p className="mb-4 text-gray-600">
              <strong>Before Day One™</strong> is a required part of your Pre-Application. This quick video explains
              what’s expected, how we assess readiness, and why our candidates consistently outperform.
            </p>
            <p className="text-gray-600">
              As part of this form, you will complete the Before Day One™ questions—focused on mindset, maturity, and
              workplace behavior. This replaces any need for separate follow-ups or post-application surveys.
            </p>
          </div>
          <div className="flex-1">
            <video
              controls
              onEnded={handleVideoEnd}
              aria-label="Before Day One informational video"
              className="w-full max-w-[600px] rounded-lg shadow-md"
            >
              <source src="/bd1-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <p className="mt-2 text-gray-600">
              <a href="/bd1-video-transcript.txt" download className="text-blue-500 hover:underline">
                Download video transcript
              </a>
            </p>
          </div>
        </motion.div>
      )}

      {step > 0 && (
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Job Application
        </h1>
      )}

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Personal Information</h2>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="fullNameError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            />
            {errors.fullName && (
              <p
                id="fullNameError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.fullName}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="emailError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            />
            {errors.email && (
              <p
                id="emailError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.email}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="phoneError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            />
            {errors.phone && (
              <p
                id="phoneError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.phone}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="streetAddress">
              Street Address
            </label>
            <input
              id="streetAddress"
              type="text"
              name="streetAddress"
              placeholder="Street Address"
              value={formData.streetAddress}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="streetAddressError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            />
            {errors.streetAddress && (
              <p
                id="streetAddressError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.streetAddress}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="city">
              City
            </label>
            <input
              id="city"
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="cityError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            />
            {errors.city && (
              <p
                id="cityError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.city}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="state">
              State
            </label>
            <input
              id="state"
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="stateError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            />
            {errors.state && (
              <p
                id="stateError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.state}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="zipCode">
              Zip Code
            </label>
            <input
              id="zipCode"
              type="text"
              name="zipCode"
              placeholder="Zip Code"
              value={formData.zipCode}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="zipCodeError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            />
            {errors.zipCode && (
              <p
                id="zipCodeError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.zipCode}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="dateAvailable">
              Date Available to Start Work
            </label>
            <input
              id="dateAvailable"
              type="date"
              name="dateAvailable"
              value={formData.dateAvailable}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="dateAvailableError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            />
            {errors.dateAvailable && (
              <p
                id="dateAvailableError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.dateAvailable}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="workAuthorization">
              Are you authorized to work in the United States?
            </label>
            <select
              id="workAuthorization"
              name="workAuthorization"
              value={formData.workAuthorization}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="workAuthorizationError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.workAuthorization && (
              <p
                id="workAuthorizationError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.workAuthorization}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="reliableTransportation">
              Do you have reliable transportation?
            </label>
            <select
              id="reliableTransportation"
              name="reliableTransportation"
              value={formData.reliableTransportation}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="reliableTransportationError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.reliableTransportation && (
              <p
                id="reliableTransportationError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.reliableTransportation}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="isAdult">
              Are you at least 18 years of age?
            </label>
            <select
              id="isAdult"
              name="isAdult"
              value={formData.isAdult}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="isAdultError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.isAdult && (
              <p
                id="isAdultError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.isAdult}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="validID">
              Do you have a valid Driver’s License or State Issued ID?
            </label>
            <select
              id="validID"
              name="validID"
              value={formData.validID}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="validIDError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.validID && (
              <p
                id="validIDError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.validID}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="currentlyEmployed">
              Are you currently employed?
            </label>
            <select
              id="currentlyEmployed"
              name="currentlyEmployed"
              value={formData.currentlyEmployed}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="currentlyEmployedError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.currentlyEmployed && (
              <p
                id="currentlyEmployedError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.currentlyEmployed}
              </p>
            )}
          </div>
          {formData.currentlyEmployed === "Yes" && (
            <div className="mb-4">
              <label className="block mb-2 text-gray-700" htmlFor="noticeRequired">
                Will you need to give notice to your current employer?
              </label>
              <select
                id="noticeRequired"
                name="noticeRequired"
                value={formData.noticeRequired}
                onChange={handleChange}
                aria-required="true"
                aria-describedby="noticeRequiredError"
                className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
              {errors.noticeRequired && (
                <p
                  id="noticeRequiredError"
                  className="text-red-500 text-sm mt-1"
                  role="alert"
                >
                  {errors.noticeRequired}
                </p>
              )}
            </div>
          )}
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Availability</h2>
          <fieldset className="mb-4">
            <legend className="mb-2 text-gray-700">
              What days are you available to work? (Select all that apply)
            </legend>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
              <div key={day} className="mb-2">
                <input
                  type="checkbox"
                  id={`availabilityDays-${day}`}
                  name="availabilityDays"
                  value={day}
                  checked={formData.availabilityDays.includes(day)}
                  onChange={handleChange}
                  className="mr-2 accent-[#D4AF37]"
                />
                <label className="text-gray-700" htmlFor={`availabilityDays-${day}`}>
                  {day}
                </label>
              </div>
            ))}
            {errors.availabilityDays && (
              <p
                id="availabilityDaysError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.availabilityDays}
              </p>
            )}
          </fieldset>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="earliestStartTime">
              Earliest time you are available to begin work
            </label>
            <input
              id="earliestStartTime"
              type="time"
              name="earliestStartTime"
              value={formData.earliestStartTime}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="earliestStartTimeError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            />
            {errors.earliestStartTime && (
              <p
                id="earliestStartTimeError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.earliestStartTime}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="latestEndTime">
              Latest time you are available to end work
            </label>
            <input
              id="latestEndTime"
              type="time"
              name="latestEndTime"
              value={formData.latestEndTime}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="latestEndTimeError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            />
            {errors.latestEndTime && (
              <p
                id="latestEndTimeError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.latestEndTime}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="overnightAvailability">
              Are you available to work overnight (between 10 PM and 6 AM)?
            </label>
            <select
              id="overnightAvailability"
              name="overnightAvailability"
              value={formData.overnightAvailability}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="overnightAvailabilityError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.overnightAvailability && (
              <p
                id="overnightAvailabilityError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.overnightAvailability}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="overtimeAvailability">
              Are you willing to work overtime and weekends if needed?
            </label>
            <select
              id="overtimeAvailability"
              name="overtimeAvailability"
              value={formData.overtimeAvailability}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="overtimeAvailabilityError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Occasionally / Case by Case">Occasionally / Case by Case</option>
            </select>
            {errors.overtimeAvailability && (
              <p
                id="overtimeAvailabilityError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.overtimeAvailability}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="unavailableHours">
              Specific hours or days you cannot work
            </label>
            <textarea
              id="unavailableHours"
              name="unavailableHours"
              placeholder="Specific hours or days you cannot work"
              value={formData.unavailableHours}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="employmentType">
              Seeking full-time or part-time employment?
            </label>
            <select
              id="employmentType"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="employmentTypeError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            >
              <option value="">Select</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Either / Open to both">Either / Open to both</option>
            </select>
            {errors.employmentType && (
              <p
                id="employmentTypeError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.employmentType}
              </p>
            )}
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">
            Emergency Contact, Education, and References
          </h2>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="emergencyContactName">
              Emergency Contact Full Name
            </label>
            <input
              id="emergencyContactName"
              type="text"
              name="emergencyContactName"
              placeholder="Emergency Contact Full Name"
              value={formData.emergencyContactName}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="emergencyContactNameError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            />
            {errors.emergencyContactName && (
              <p
                id="emergencyContactNameError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.emergencyContactName}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="emergencyContactPhone">
              Emergency Contact Phone Number
            </label>
            <input
              id="emergencyContactPhone"
              type="tel"
              name="emergencyContactPhone"
              placeholder="Emergency Contact Phone Number"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="emergencyContactPhoneError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            />
            {errors.emergencyContactPhone && (
              <p
                id="emergencyContactPhoneError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.emergencyContactPhone}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="emergencyContactRelationship">
              Emergency Contact Relationship
            </label>
            <input
              id="emergencyContactRelationship"
              type="text"
              name="emergencyContactRelationship"
              placeholder="Relationship"
              value={formData.emergencyContactRelationship}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="emergencyContactRelationshipError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            />
            {errors.emergencyContactRelationship && (
              <p
                id="emergencyContactRelationshipError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.emergencyContactRelationship}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="highestEducation">
              Highest Education Level Completed
            </label>
            <select
              id="highestEducation"
              name="highestEducation"
              value={formData.highestEducation}
              onChange={handleChange}
              aria-required="true"
              aria-describedby="highestEducationError"
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
            >
              <option value="">Select</option>
              <option value="Less than High School">Less than High School</option>
              <option value="High School Diploma / GED">High School Diploma / GED</option>
              <option value="Some College">Some College</option>
              <option value="Associate Degree">Associate Degree</option>
              <option value="Bachelor’s Degree">Bachelor’s Degree</option>
              <option value="Master’s Degree or higher">Master’s Degree or higher</option>
            </select>
            {errors.highestEducation && (
              <p
                id="highestEducationError"
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.highestEducation}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="educationProof">
              Upload Proof of Education (Diploma, GED, or Transcripts, optional)
            </label>
            <input
              id="educationProof"
              type="file"
              name="educationProof"
              accept=".pdf,.jpg,.png"
              onChange={handleChange}
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base bg-white"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700" htmlFor="resume">
              Upload Your Resume (optional)
            </label>
            <input
              id="resume"
              type="file"
              name="resume"
              accept=".pdf"
              onChange={handleChange}
              className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base bg-white"
            />
          </div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">References</h3>
          {formData.candidate_references.map((ref, index) => (
            <div key={index} className="mb-6 p-4 border-2 border-[#D4AF37] rounded-lg shadow-md">
              <p className="font-bold mb-2 text-gray-700">Reference #{index + 1}</p>
              <div className="mb-4">
                <label className="block mb-1 text-gray-600" htmlFor={`ref${index}Name`}>
                  Full Name
                </label>
                <input
                  id={`ref${index}Name`}
                  name={`ref${index}Name`}
                  type="text"
                  placeholder="Full Name"
                  value={ref.name}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
                />
                {errors[`ref${index}Name`] && (
                  <p className="text-red-500 text-sm mt-1" role="alert">
                    {errors[`ref${index}Name`]}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-gray-600" htmlFor={`ref${index}Relationship`}>
                  Relationship
                </label>
                <input
                  id={`ref${index}Relationship`}
                  name={`ref${index}Relationship`}
                  type="text"
                  placeholder="Relationship"
                  value={ref.relationship}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
                />
                {errors[`ref${index}Relationship`] && (
                  <p className="text-red-500 text-sm mt-1" role="alert">
                    {errors[`ref${index}Relationship`]}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-gray-600" htmlFor={`ref${index}Phone`}>
                  Phone Number
                </label>
                <input
                  id={`ref${index}Phone`}
                  name={`ref${index}Phone`}
                  type="tel"
                  placeholder="Phone Number"
                  value={ref.phone}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
                />
                {errors[`ref${index}Phone`] && (
                  <p className="text-red-500 text-sm mt-1" role="alert">
                    {errors[`ref${index}Phone`]}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-gray-600" htmlFor={`ref${index}Email`}>
                  Email Address
                </label>
                <input
                  id={`ref${index}Email`}
                  name={`ref${index}Email`}
                  type="email"
                  placeholder="Email Address"
                  value={ref.email}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
                />
                {errors[`ref${index}Email`] && (
                  <p className="text-red-500 text-sm mt-1" role="alert">
                    {errors[`ref${index}Email`]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {step === 4 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Before Day 1™ Behavioral Verification</h2>
          <p className="mb-6 text-gray-600">
            These questions assess your approach to work scenarios. Please select the option that best reflects your
            behavior.
          </p>
          {bd1Questions.map((q) => (
            <div key={q.id} className="mb-4">
              <label className="block mb-2 text-gray-700" htmlFor={q.id}>
                {q.question}
              </label>
              <select
                id={q.id}
                name={q.id}
                value={formData[q.id]}
                onChange={handleChange}
                aria-required="true"
                aria-describedby={`${q.id}Error`}
                className="w-full p-3 border-2 border-[#D4AF37] rounded-lg text-base outline-none bg-white focus:ring-2 focus:ring-[#D4AF37]"
              >
                <option value="">Select an option</option>
                {q.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors[q.id] && (
                <p
                  id={`${q.id}Error`}
                  className="text-red-500 text-sm mt-1"
                  role="alert"
                >
                  {errors[q.id]}
                </p>
              )}
            </div>
          ))}
          <div className="mb-4">
            <label className="flex items-center text-gray-700">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mr-2 accent-[#D4AF37]"
              />
              I agree to the{' '}
              <Link href="/terms" className="text-blue-500 hover:underline mx-1">
                Terms of Use
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-500 hover:underline mx-1">
                Privacy Policy
              </Link>
            </label>
            {errors.agreeToTerms && (
              <p
                className="text-red-500 text-sm mt-1"
                role="alert"
              >
                {errors.agreeToTerms}
              </p>
            )}
          </div>
        </motion.div>
      )}

      <div className="mt-6 flex gap-4 justify-center">
        {step > 1 && (
          <button
            type="button"
            onClick={handlePrevStep}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Previous
          </button>
        )}
        {step < 4 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="px-6 py-3 bg-[#D4AF37] text-white rounded-lg hover:bg-[#A68B2A] transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-3 bg-[#D4AF37] text-white rounded-lg hover:bg-[#A68B2A] transition-colors"
          >
            Submit Application
          </button>
        )}
      </div>
    </motion.div>
  );
}