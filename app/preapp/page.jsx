"use client";
import React, { useState } from "react";

export default function PreAppPage() {
  // Form state
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    dateAvailable: "",
    workAuth: "",
    hasTransport: "",
    isAdult: "",
    hasID: "",
    employed: "",
    employmentType: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    education: "",
    educationProof: null,
    resume: null,
    references: [
      { name: "", relationship: "", phone: "", email: "" },
      { name: "", relationship: "", phone: "", email: "" },
      { name: "", relationship: "", phone: "", email: "" },
    ],
    bd1_1: "",
    bd1_2: "",
    bd1_3: "",
    bd1_4: "",
    bd1_5: "",
    agree: false,
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name.startsWith("reference")) {
      const idx = parseInt(name.split("_")[1], 10);
      const field = name.split("_")[2];
      const newRefs = [...form.references];
      newRefs[idx][field] = value;
      setForm({ ...form, references: newRefs });
    } else if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else if (type === "file") {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Handle submit (stub)
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add validation and API submission here
    alert("PreApplication submitted! (This is a placeholder)");
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <img src="/peak-logo.png" alt="Peak Logo" className="mx-auto mb-6 h-16" />
      <h1 className="text-2xl font-bold mb-2">Start Strong with Peak</h1>
      <p className="mb-6">
        At Peak Talent Capital Solutions, we believe your success starts long before your first day on the job. That’s why our pre-application process is designed to go deeper—capturing who you are, how you work, and what you’re ready to bring to the table. This isn’t a quick form. It’s your official first step in building a career that fits.
      </p>
      <p className="mb-4">
        Whether this is your first time applying or you’ve worked with us before, this comprehensive form helps us understand your readiness, mindset, skills, availability, and aspirations. It also includes our <strong>Before Day One™</strong> program—required for every candidate and used to ensure alignment with the standards and expectations of the organizations we proudly represent.
      </p>
      <p className="mb-4">
        If you’ve already submitted a resume or spoken with a Peak recruiter, you do not need to upload your resume again unless directed. Duplicate submissions can delay processing and may result in removal from consideration. If you don’t yet have a resume, we offer a Custom Resume Builder service—just upload a simple Word doc outlining your skills and we’ll handle the rest.
      </p>
      <p className="mb-4">
        Custom resumes start at just $25 and are tailored to position you competitively in today’s workforce.
      </p>
      <p className="mb-6 font-semibold text-blue-900">
        This is more than an application. It’s your introduction to Peak—and your path forward starts here.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BD1 Video Section */}
        <section>
          <h2 className="text-xl font-bold mb-2">Before Day One™ (BD1) Video — Required</h2>
          <p className="mb-2">
            Every candidate must watch the BD1 video before completing the application form below. The BD1 program ensures you understand the standards, expectations, and culture of the organizations we represent. You will need to answer questions about the video as part of this process.
          </p>
          <div className="mb-2">
            <video controls width="100%">
              <source src="/bd1-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <a href="/bd1-transcript.pdf" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
            BD1 video transcript
          </a>
          <div className="text-xs text-gray-600 mt-1">
            If you require accommodations to access this content, contact us for assistance.
          </div>
        </section>

        {/* Basic Info */}
        <section>
          <h2 className="text-lg font-semibold mt-6 mb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Full Name" className="input" />
            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Email" className="input" />
            <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone" className="input" />
            <input name="address" value={form.address} onChange={handleChange} placeholder="Street Address" className="input" />
            <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="input" />
            <input name="state" value={form.state} onChange={handleChange} placeholder="State" className="input" />
            <input name="zip" value={form.zip} onChange={handleChange} placeholder="ZIP Code" className="input" />
            <input name="dateAvailable" type="date" value={form.dateAvailable} onChange={handleChange} required placeholder="Date Available" className="input" />
          </div>
        </section>

        {/* Work Auth & Eligibility */}
        <section>
          <h2 className="text-lg font-semibold mt-6 mb-2">Eligibility</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select name="workAuth" value={form.workAuth} onChange={handleChange} required className="select">
              <option value="">Work Authorization</option>
              <option value="us-citizen">U.S. Citizen</option>
              <option value="permanent-resident">Permanent Resident</option>
              <option value="temporary-visa">Temporary Visa</option>
              <option value="other">Other</option>
            </select>
            <select name="hasTransport" value={form.hasTransport} onChange={handleChange} required className="select">
              <option value="">Do you have reliable transportation?</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <select name="isAdult" value={form.isAdult} onChange={handleChange} required className="select">
              <option value="">Are you 18 or older?</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <select name="hasID" value={form.hasID} onChange={handleChange} required className="select">
              <option value="">Do you have a valid government-issued ID?</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <select name="employed" value={form.employed} onChange={handleChange} required className="select">
              <option value="">Are you currently employed?</option>
              <option value="yes-full">Yes, full-time</option>
              <option value="yes-part">Yes, part-time</option>
              <option value="no">No</option>
            </select>
            <select name="employmentType" value={form.employmentType} onChange={handleChange} required className="select">
              <option value="">What type of employment are you seeking?</option>
              <option value="full">Full Time</option>
              <option value="part">Part Time</option>
              <option value="contract">Contract</option>
              <option value="temporary">Temporary</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </section>

        {/* Emergency Contact */}
        <section>
          <h2 className="text-lg font-semibold mt-6 mb-2">Emergency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="emergencyName" value={form.emergencyName} onChange={handleChange} required placeholder="Name" className="input" />
            <input name="emergencyPhone" value={form.emergencyPhone} onChange={handleChange} required placeholder="Phone" className="input" />
            <input name="emergencyRelation" value={form.emergencyRelation} onChange={handleChange} required placeholder="Relationship" className="input" />
          </div>
        </section>

        {/* Education */}
        <section>
          <h2 className="text-lg font-semibold mt-6 mb-2">Education</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select name="education" value={form.education} onChange={handleChange} required className="select">
              <option value="">Highest Level of Education</option>
              <option value="highschool">High School Diploma/GED</option>
              <option value="associates">Associate Degree</option>
              <option value="bachelors">Bachelor's Degree</option>
              <option value="masters">Master's Degree</option>
              <option value="doctorate">Doctorate</option>
              <option value="other">Other</option>
            </select>
            <label className="block">
              Upload Education Proof
              <input name="educationProof" type="file" onChange={handleChange} className="block mt-1" />
            </label>
          </div>
        </section>

        {/* Resume */}
        <section>
          <h2 className="text-lg font-semibold mt-6 mb-2">Resume</h2>
          <label className="block">
            Upload Resume
            <input name="resume" type="file" onChange={handleChange} className="block mt-1" />
          </label>
        </section>

        {/* References */}
        <section>
          <h2 className="text-lg font-semibold mt-6 mb-2">References (required)</h2>
          {[0, 1, 2].map((i) => (
            <div key={i} className="mb-3 grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                name={`reference_${i}_name`}
                value={form.references[i].name}
                onChange={handleChange}
                placeholder={`Reference ${i + 1} Name`}
                required
                className="input"
              />
              <input
                name={`reference_${i}_relationship`}
                value={form.references[i].relationship}
                onChange={handleChange}
                placeholder="Relationship"
                required
                className="input"
              />
              <input
                name={`reference_${i}_phone`}
                value={form.references[i].phone}
                onChange={handleChange}
                placeholder="Phone"
                required
                className="input"
              />
              <input
                name={`reference_${i}_email`}
                value={form.references[i].email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="input"
              />
            </div>
          ))}
        </section>

        {/* BD1 Questions */}
        <section>
          <h2 className="text-lg font-semibold mt-6 mb-2">Work Ethic Questions — Before Day One™</h2>
          <p className="mb-2 text-gray-700">
            Please answer the following questions. Your responses help us evaluate your alignment with Peak’s standards and expectations.
          </p>
          <label className="block mb-2">
            1. In your own words, what does professionalism mean to you?
            <textarea
              name="bd1_1"
              value={form.bd1_1}
              onChange={handleChange}
              required
              className="textarea"
            />
          </label>
          <label className="block mb-2">
            2. Describe a time you went above and beyond for an employer, team, or customer.
            <textarea
              name="bd1_2"
              value={form.bd1_2}
              onChange={handleChange}
              required
              className="textarea"
            />
          </label>
          <label className="block mb-2">
            3. How do you handle constructive criticism in the workplace?
            <textarea
              name="bd1_3"
              value={form.bd1_3}
              onChange={handleChange}
              required
              className="textarea"
            />
          </label>
          <label className="block mb-2">
            4. What does it mean to be a reliable employee? Provide an example from your experience.
            <textarea
              name="bd1_4"
              value={form.bd1_4}
              onChange={handleChange}
              required
              className="textarea"
            />
          </label>
          <label className="block mb-2">
            5. Why is it important to understand and meet the expectations of the company you work for?
            <textarea
              name="bd1_5"
              value={form.bd1_5}
              onChange={handleChange}
              required
              className="textarea"
            />
          </label>
        </section>

        {/* Agree to Terms */}
        <section>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} required />
            I agree to the <a href="/terms" className="underline text-blue-600">Terms of Use</a> and <a href="/privacy" className="underline text-blue-600">Privacy Policy</a>.
          </label>
        </section>

        {/* Submit */}
        <button type="submit" className="bg-blue-800 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 w-full mt-4">
          Submit PreApplication
        </button>
      </form>

      <footer className="text-xs text-center mt-10 text-gray-500">
        <p>Peak is an Equal Opportunity Employer.</p>
        <p>
          It is the policy of Peak Employment Solutions, LLC to provide equal employment opportunity (EEO) to all persons regardless of age, color, national origin, citizenship status, physical or mental disability, race, religion, creed, gender, sex, sexual orientation, gender identity and/or expression, genetic information, marital status, status with regard to public assistance, veteran status, or any other characteristic protected by federal, state or local law. In addition, Peak Employment Solutions, LLC will provide reasonable accommodations for qualified individuals with disabilities.
        </p>
        <p className="mt-3">&copy; 2025 Pivot OS. All rights reserved.</p>
      </footer>
    </main>
  );
}