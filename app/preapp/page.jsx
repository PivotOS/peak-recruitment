"use client";

import { useState, useEffect, Suspense } from "react";
import { db, storage } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

// BD1 questions and correct answers
const bd1Questions = [
  // ... (no changes needed here, keep your questions as is)
];

// Helper to fetch jobId from query params
function JobIdFetcher({ setFormData }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const jobId = searchParams.get("jobId");
    if (jobId) setFormData((prev) => ({ ...prev, jobId }));
  }, [searchParams, setFormData]);
  return null;
}

// Utility to shuffle BD1 answers
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

function CustomInput({ id, label, type, name, value, onChange, error, required = false }) {
  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-base font-semibold text-gray-700">{label}</label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 p-3 w-full border-2 border-yellow-500 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-base shadow-sm transition-all duration-200 hover:border-blue-500"
        aria-required={required}
        aria-describedby={error ? `${id}Error` : undefined}
        required={required}
      />
      {error && <p id={`${id}Error`} className="mt-1 text-red-600 text-sm">{error}</p>}
    </div>
  );
}

function CustomFileInput({ id, label, name, onChange, error, accept }) {
  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-base font-semibold text-gray-700">{label}</label>
      <input
        id={id}
        type="file"
        name={name}
        onChange={onChange}
        accept={accept}
        className="mt-1 p-2 w-full border-2 border-yellow-500 rounded-lg bg-white"
      />
      {error && <p id={`${id}Error`} className="mt-1 text-red-600 text-sm">{error}</p>}
    </div>
  );
}

function CustomSelect({ id, label, name, value, onChange, options, error, required = false }) {
  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-base font-semibold text-gray-700">{label}</label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 p-3 w-full border-2 border-yellow-500 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-base shadow-sm transition-all duration-200 hover:border-blue-500"
        aria-required={required}
        aria-describedby={error ? `${id}Error` : undefined}
        required={required}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value || option} value={option.value || option}>{option.label || option}</option>
        ))}
      </select>
      {error && <p id={`${id}Error`} className="mt-1 text-red-600 text-sm">{error}</p>}
    </div>
  );
}

function CustomCheckbox({ id, label, name, checked, onChange, error, children }) {
  return (
    <div className="mb-6">
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
          className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded"
        />
        <span className="ml-2 text-base text-gray-700">{label}{children}</span>
      </label>
      {error && <p id={`${id}Error`} className="mt-1 text-red-600 text-sm">{error}</p>}
    </div>
  );
}

function ReferenceInput({ idx, refData, handleRefChange, errors }) {
  return (
    <div className="mb-4 border border-yellow-300 rounded-xl p-3 bg-yellow-50">
      <h4 className="font-semibold text-yellow-700 mb-2">Reference {idx + 1}</h4>
      <CustomInput
        id={`ref_name_${idx}`}
        label="Name"
        type="text"
        name="name"
        value={refData.name}
        onChange={(e) => handleRefChange(idx, "name", e.target.value)}
        error={errors && errors.name}
        required
      />
      <CustomInput
        id={`ref_relationship_${idx}`}
        label="Relationship"
        type="text"
        name="relationship"
        value={refData.relationship}
        onChange={(e) => handleRefChange(idx, "relationship", e.target.value)}
        error={errors && errors.relationship}
        required
      />
      <CustomInput
        id={`ref_phone_${idx}`}
        label="Phone"
        type="tel"
        name="phone"
        value={refData.phone}
        onChange={(e) => handleRefChange(idx, "phone", e.target.value)}
        error={errors && errors.phone}
        required
      />
      <CustomInput
        id={`ref_email_${idx}`}
        label="Email"
        type="email"
        name="email"
        value={refData.email}
        onChange={(e) => handleRefChange(idx, "email", e.target.value)}
        error={errors && errors.email}
        required
      />
    </div>
  );
}

// File upload utility
async function uploadFileAndGetURL(file, path) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

function PreAppContent({
  formData,
  setFormData,
  errors,
  setErrors,
  router,
}) {
  // Input handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleRefChange = (idx, field, value) => {
    setFormData((prev) => {
      const newRefs = [...prev.candidate_references];
      newRefs[idx][field] = value;
      return { ...prev, candidate_references: newRefs };
    });
  };

  // Validation
  const validate = () => {
    const errs = {};
    if (!formData.fullName) errs.fullName = "Full name required";
    if (!formData.email) errs.email = "Email required";
    if (!formData.phone) errs.phone = "Phone required";
    if (!formData.streetAddress) errs.streetAddress = "Street address required";
    if (!formData.city) errs.city = "City required";
    if (!formData.state) errs.state = "State required";
    if (!formData.zipCode) errs.zipCode = "ZIP code required";
    if (!formData.dateAvailable) errs.dateAvailable = "Start date required";
    if (!formData.workAuthorization) errs.workAuthorization = "Select your work authorization";
    if (!formData.reliableTransportation) errs.reliableTransportation = "Required";
    if (!formData.isAdult) errs.isAdult = "Required";
    if (!formData.validID) errs.validID = "Required";
    if (!formData.currentlyEmployed) errs.currentlyEmployed = "Required";
    if (formData.currentlyEmployed === "Yes" && !formData.noticeRequired)
      errs.noticeRequired = "Please specify notice requirement";
    if (!formData.employmentType) errs.employmentType = "Select employment type";
    if (!formData.emergencyContactName) errs.emergencyContactName = "Required";
    if (!formData.emergencyContactPhone) errs.emergencyContactPhone = "Required";
    if (!formData.emergencyContactRelationship) errs.emergencyContactRelationship = "Required";
    if (!formData.highestEducation) errs.highestEducation = "Required";
    if (!formData.educationProof) errs.educationProof = "Upload required";
    if (!formData.resume) errs.resume = "Upload required";
    formData.candidate_references.forEach((ref, idx) => {
      if (!ref.name || !ref.relationship || !ref.phone || !ref.email) {
        if (!errs.candidate_references) errs.candidate_references = {};
        errs.candidate_references[idx] = {
          name: !ref.name ? "Required" : "",
          relationship: !ref.relationship ? "Required" : "",
          phone: !ref.phone ? "Required" : "",
          email: !ref.email ? "Required" : "",
        };
      }
    });
    // BD1
    bd1Questions.forEach((q) => {
      if (!formData[q.id]) {
        if (!errs.bd1) errs.bd1 = {};
        errs.bd1[q.id] = "Required";
      }
    });
    // Agreement
    if (!formData.agreeToTerms) errs.agreeToTerms = "You must agree to terms.";
    return errs;
  };

  // Score BD1 answers
  const scoreBD1 = () => {
    let score = 0;
    bd1Questions.forEach((q) => {
      if (formData[q.id] === q.correct) score += 1;
    });
    return score;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Upload files
    let educationProofUrl = null, resumeUrl = null;
    if (formData.educationProof)
      educationProofUrl = await uploadFileAndGetURL(
        formData.educationProof,
        `educationProofs/${formData.fullName}_${Date.now()}`
      );
    if (formData.resume)
      resumeUrl = await uploadFileAndGetURL(
        formData.resume,
        `resumes/${formData.fullName}_${Date.now()}`
      );

    // Score BD1
    const bd1Score = scoreBD1();

    // Save to Firestore - always add isHPP and recruiterNotes!
    await addDoc(collection(db, "preApps"), {
      ...formData,
      educationProof: educationProofUrl,
      resume: resumeUrl,
      bd1Score,
      submittedAt: new Date(),
      isHPP: false,
      recruiterNotes: "",
    });

    router.push("/thank-you");
  };

  // Initial shuffled BD1 options
  const [bd1ShuffledOptions, setBd1ShuffledOptions] = useState({});
  useEffect(() => {
    const shuffled = {};
    bd1Questions.forEach((q) => {
      shuffled[q.id] = shuffleArray(q.options);
    });
    setBd1ShuffledOptions(shuffled);
  }, []);

  // BD1 video and transcript URLs
  const bd1VideoUrl = "https://firebasestorage.googleapis.com/v0/b/peak-platform-preapp.firebasestorage.app/o/bd1-video.mp4?alt=media&token=677af7f1-a298-4fde-91a0-b5eb900a488f";
  const bd1TranscriptUrl = "/bd1-video-transcript.txt";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center bg-gradient-to-br from-white via-[#fdf7ee] to-gray-200 py-10"
    >
      {/* Logo & Navigation */}
      <div className="w-full flex flex-col items-center mb-8">
        <a
          href="https://peaktcs.com"
          target="_blank"
          rel="noopener noreferrer"
          className="self-start inline-flex items-center gap-2 px-5 py-2 bg-peak-blue text-white rounded-lg text-base font-semibold shadow hover:bg-blue-800 transition mb-4"
        >
          ← Home
        </a>
        <img src="/peaklogo.png" alt="Peak Logo" className="w-[340px] max-w-full h-auto mb-4" />
      </div>
      {/* Intro Section */}
      <section className="bg-white/95 w-full max-w-6xl rounded-2xl shadow-2xl border border-yellow-300 p-8 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-peak-blue mb-4 text-center">Start Strong with Peak</h1>
        <p className="text-lg text-gray-800 mb-4">
          At Peak Talent Capital Solutions, we believe your success starts long before your first day on the job. That’s why our pre-application process is designed to go deeper—capturing who you are, how you work, and what you’re ready to bring to the table. <strong>This isn’t a quick form. It’s your official first step in building a career that fits.</strong>
        </p>
        <p className="text-lg text-gray-800 mb-4">
          Whether this is your first time applying or you’ve worked with us before, this comprehensive form helps us understand your readiness, mindset, skills, availability, and aspirations. It also includes our <strong>Before Day One™</strong> program—<span className="text-red-700 font-bold">required for every candidate</span> and used to ensure alignment with the standards and expectations of the organizations we proudly represent.
        </p>
        <p className="text-lg text-gray-800 mb-4">
          If you’ve already submitted a resume or spoken with a Peak recruiter, you do not need to upload your resume again unless directed. <span className="font-semibold text-red-700">Duplicate submissions can delay processing and may result in removal from consideration.</span> If you don’t yet have a resume, we offer a Custom Resume Builder service—just upload a simple Word doc outlining your skills and we’ll handle the rest.
        </p>
        <p className="text-lg text-gray-800 mb-4">
          Custom resumes start at just <span className="font-bold">$25</span> and are tailored to position you competitively in today’s workforce.
        </p>
        <p className="text-lg text-peak-blue font-semibold mb-0">
          This is more than an application. It’s your introduction to Peak—and your path forward starts here.
        </p>
      </section>
      {/* Main Form Section */}
      <section className="bg-white/95 w-full max-w-6xl rounded-2xl shadow-2xl border border-yellow-300 p-8">
        <form onSubmit={handleSubmit} noValidate>
          {/* BD1 Video Section */}
          <div className="mb-10 flex flex-col md:flex-row gap-10 items-start">
            <div className="flex-1 min-w-[260px]">
              <h2 className="text-2xl font-bold text-peak-blue mb-2">Before Day One™ (BD1) Video — <span className="text-red-700 font-bold">Required</span></h2>
              <p className="text-gray-800 mb-4">
                <strong>Every candidate must watch the BD1 video before completing the application form below.</strong> The BD1 program ensures you understand the standards, expectations, and culture of the organizations we represent. You will need to answer questions about the video as part of this process.
              </p>
              <a
                href={bd1TranscriptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mb-2 text-blue-700 underline hover:text-blue-900 font-medium"
              >
                BD1 video transcript
              </a>
              <p className="text-gray-600 text-sm">If you require accommodations to access this content, contact us for assistance.</p>
            </div>
            <div className="flex-1 flex justify-center items-center min-w-[320px]">
              <video controls className="rounded-lg border border-yellow-400 w-full max-w-[430px]">
                <source src={bd1VideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
          {/* Applicant Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
            <CustomInput id="fullName" label="Full Name" type="text" name="fullName" value={formData.fullName} onChange={handleChange} error={errors.fullName} required />
            <CustomInput id="email" label="Email" type="email" name="email" value={formData.email} onChange={handleChange} error={errors.email} required />
            <CustomInput id="phone" label="Phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} required />
            <CustomInput id="streetAddress" label="Street Address" type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} error={errors.streetAddress} required />
            <CustomInput id="city" label="City" type="text" name="city" value={formData.city} onChange={handleChange} error={errors.city} required />
            <CustomInput id="state" label="State" type="text" name="state" value={formData.state} onChange={handleChange} error={errors.state} required />
            <CustomInput id="zipCode" label="ZIP Code" type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} error={errors.zipCode} required />
            <CustomInput id="dateAvailable" label="Date Available" type="date" name="dateAvailable" value={formData.dateAvailable} onChange={handleChange} error={errors.dateAvailable} required />
            <CustomSelect id="workAuthorization" label="Work Authorization" name="workAuthorization" value={formData.workAuthorization} onChange={handleChange} error={errors.workAuthorization} required options={[
              { label: "US Citizen", value: "US Citizen" },
              { label: "Green Card", value: "Green Card" },
              { label: "Work Visa", value: "Work Visa" },
              { label: "Other", value: "Other" },
            ]} />
            <CustomSelect id="reliableTransportation" label="Do you have reliable transportation?" name="reliableTransportation" value={formData.reliableTransportation} onChange={handleChange} error={errors.reliableTransportation} required options={[
              { label: "Yes", value: "Yes" },
              { label: "No", value: "No" },
            ]} />
            <CustomSelect id="isAdult" label="Are you 18 or older?" name="isAdult" value={formData.isAdult} onChange={handleChange} error={errors.isAdult} required options={[
              { label: "Yes", value: "Yes" },
              { label: "No", value: "No" },
            ]} />
            <CustomSelect id="validID" label="Do you have a valid government-issued ID?" name="validID" value={formData.validID} onChange={handleChange} error={errors.validID} required options={[
              { label: "Yes", value: "Yes" },
              { label: "No", value: "No" },
            ]} />
            <CustomSelect id="currentlyEmployed" label="Are you currently employed?" name="currentlyEmployed" value={formData.currentlyEmployed} onChange={handleChange} error={errors.currentlyEmployed} required options={[
              { label: "Yes", value: "Yes" },
              { label: "No", value: "No" },
            ]} />
            {formData.currentlyEmployed === "Yes" && (
              <CustomInput id="noticeRequired" label="If yes, how much notice do you need to give?" type="text" name="noticeRequired" value={formData.noticeRequired} onChange={handleChange} error={errors.noticeRequired} required />
            )}
            <CustomSelect id="employmentType" label="What type of employment are you seeking?" name="employmentType" value={formData.employmentType} onChange={handleChange} error={errors.employmentType} required options={[
              { label: "Full-time", value: "Full-time" },
              { label: "Part-time", value: "Part-time" },
              { label: "Temporary", value: "Temporary" },
              { label: "Temp-to-Hire", value: "Temp-to-Hire" },
              { label: "Other", value: "Other" },
            ]} />
            <CustomInput id="emergencyContactName" label="Emergency Contact Name" type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} error={errors.emergencyContactName} required />
            <CustomInput id="emergencyContactPhone" label="Emergency Contact Phone" type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} error={errors.emergencyContactPhone} required />
            <CustomInput id="emergencyContactRelationship" label="Emergency Contact Relationship" type="text" name="emergencyContactRelationship" value={formData.emergencyContactRelationship} onChange={handleChange} error={errors.emergencyContactRelationship} required />
            <CustomSelect id="highestEducation" label="Highest Level of Education" name="highestEducation" value={formData.highestEducation} onChange={handleChange} error={errors.highestEducation} required options={[
              { label: "High School", value: "High School" },
              { label: "Some College", value: "Some College" },
              { label: "Associate Degree", value: "Associate Degree" },
              { label: "Bachelor's Degree", value: "Bachelor's Degree" },
              { label: "Graduate Degree", value: "Graduate Degree" },
              { label: "Other", value: "Other" },
            ]} />
            <CustomFileInput id="educationProof" label="Upload Education Proof" name="educationProof" onChange={handleFileChange} error={errors.educationProof} accept=".pdf,.png,.jpg,.jpeg" />
            <CustomFileInput id="resume" label="Upload Resume" name="resume" onChange={handleFileChange} error={errors.resume} accept=".pdf,.doc,.docx" />
          </div>
          {/* References */}
          <h3 className="text-lg font-semibold mt-8 mb-2 text-yellow-700">References (required)</h3>
          {formData.candidate_references.map((ref, idx) => (
            <ReferenceInput
              key={idx}
              idx={idx}
              refData={ref}
              handleRefChange={handleRefChange}
              errors={errors.candidate_references && errors.candidate_references[idx]}
            />
          ))}
          {/* BD1 Verification */}
          <h3 className="text-lg font-semibold mt-8 mb-2 text-yellow-700">Work Ethic Questions — Before Day One™</h3>
          <p className="mb-4 text-gray-700">Please answer the following questions. Your responses help us evaluate your alignment with Peak’s standards and expectations.</p>
          {bd1Questions.map((q, idx) => (
            <div key={q.id} className="mb-6">
              <label className="block font-medium text-gray-700 mb-2">{idx + 1}. {q.question}</label>
              <div>
                {(bd1ShuffledOptions[q.id] || q.options).map((opt) => (
                  <label key={opt} className="block mb-1">
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={formData[q.id] === opt}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {opt}
                  </label>
                ))}
                {errors.bd1 && errors.bd1[q.id] && (
                  <p className="text-red-600 text-sm">{errors.bd1[q.id]}</p>
                )}
              </div>
            </div>
          ))}
          {/* Terms and Submit */}
          <CustomCheckbox
            id="agreeToTerms"
            label={
              <>
                I agree to the{" "}
                <a href="https://www.peaktcs.com/terms-of-use" target="_blank" rel="noopener noreferrer" className="underline text-blue-700 hover:text-blue-900">
                  Terms of Use
                </a>
                {" "}and{" "}
                <a href="https://www.peaktcs.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-blue-700 hover:text-blue-900">
                  Privacy Policy
                </a>
                .
              </>
            }
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            error={errors.agreeToTerms}
          />
          <button
            type="submit"
            className="w-full mt-4 p-4 bg-peak-gold text-white text-center rounded-lg text-lg font-semibold hover:bg-yellow-600 transition-colors duration-200"
          >
            Submit PreApplication
          </button>
        </form>
        {/* EEO Statement */}
        <footer className="mt-12 pt-8 border-t border-yellow-200 text-center text-gray-600 text-sm">
          <p className="font-semibold">Peak is an Equal Opportunity Employer.</p>
          <p>
            It is the policy of Peak Employment Solutions, LLC to provide equal employment opportunity (EEO) to all persons regardless of age, color, national origin, citizenship status, physical or mental disability, race, religion, creed, gender, sex, sexual orientation, gender identity and/or expression, genetic information, marital status, status with regard to public assistance, veteran status, or any other characteristic protected by federal, state or local law. In addition, Peak Employment Solutions, LLC will provide reasonable accommodations for qualified individuals with disabilities.
          </p>
          <p className="mt-6 text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Pivot OS. All rights reserved.
          </p>
        </footer>
      </section>
    </motion.div>
  );
}

export default function PreApp() {
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
  });
  const [errors, setErrors] = useState({});
  const router = useRouter();

  return (
    <Suspense fallback={<div className="text-center p-6 text-gray-600 bg-white rounded-lg shadow-md">Loading application form...</div>}>
      <JobIdFetcher setFormData={setFormData} />
      <PreAppContent
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        router={router}
      />
    </Suspense>
  );
}
TEST123