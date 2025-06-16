"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThankYouPageInner />
    </Suspense>
  );
}

function ThankYouPageInner() {
  const searchParams = useSearchParams();
  const fullName = searchParams.get("fullName") || "Applicant";
  const bd1_q1 = searchParams.get("bd1_q1") || "";
  const bd1_q2 = searchParams.get("bd1_q2") || "";
  const bd1_q3 = searchParams.get("bd1_q3") || "";
  const bd1_q4 = searchParams.get("bd1_q4") || "";
  const bd1_q5 = searchParams.get("bd1_q5") || "";
  const bd1_q6 = searchParams.get("bd1_q6") || "";
  const bd1_q7 = searchParams.get("bd1_q7") || "";
  const bd1_q8 = searchParams.get("bd1_q8") || "";

  // Simple scoring: Higher score for better responses (e.g., 1-4 per answer)
  const scoreAnswers = (answer) => {
    const scores = {
      "7:45 AM — I like to be early and ready.": 4,
      "8:00 AM — Right on time means I’m on time.": 3,
      "8:05 AM — A few minutes late isn’t a big deal.": 2,
      "Depends — I show up when I can.": 1,
      "I reflect and use it to improve.": 4,
      "I explain why I did it that way.": 3,
      "I get defensive but eventually adjust.": 2,
      "I ignore it—nobody’s perfect.": 1,
      "Showing up early and ready every day.": 4,
      "Doing my best when I’m there.": 3,
      "Being available when I feel like it.": 2,
      "Trying not to get fired.": 1,
      "I jump in and help—it’s all part of the job.": 4,
      "I do them if someone tells me to.": 3,
      "I usually avoid them.": 2,
      "I don’t do extra without extra pay.": 1,
      "Help them without being asked.": 4,
      "Wait to see if they ask for help.": 3,
      "Tell a supervisor—it’s not my job.": 2,
      "Ignore it—it’s their problem.": 1,
      "Admit it, fix it, and learn from it.": 4,
      "Wait to see if anyone notices.": 3,
      "Cover it up if I can.": 2,
      "Blame the process or someone else.": 1,
      "I stay focused—it still needs to get done.": 4,
      "I do them, but I take frequent breaks.": 3,
      "I rush through them to get them over with.": 2,
      "I avoid them if I can.": 1,
      "I give full effort no matter the job.": 4,
      "I do what I’m paid to do, no more.": 3,
      "I work hard when I’m in the mood.": 2,
      "I only work hard if I see a reward.": 1,
    };
    return scores[answer] || 0;
  };

  const totalScore = [
    scoreAnswers(bd1_q1),
    scoreAnswers(bd1_q2),
    scoreAnswers(bd1_q3),
    scoreAnswers(bd1_q4),
    scoreAnswers(bd1_q5),
    scoreAnswers(bd1_q6),
    scoreAnswers(bd1_q7),
    scoreAnswers(bd1_q8),
  ].reduce((sum, score) => sum + score, 0);

  const badge = totalScore >= 24 ? "Gold" : totalScore >= 16 ? "Silver" : "Bronze";
  const suggestion = totalScore >= 24
    ? "Excellent readiness! You're a strong candidate for immediate placement."
    : totalScore >= 16
    ? "Good potential! Consider refining your responses for better opportunities."
    : "Needs improvement. Focus on consistency and responsibility for future roles.";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-white to-gray-50 p-8 flex items-center justify-center"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Thank You, {fullName}!</h1>
        <p className="text-lg mb-4 text-gray-600">Badge Earned: <strong>{badge}</strong></p>
        <p className="text-lg mb-4 text-gray-600">BD1 Score: <strong>{totalScore}/32</strong></p>
        <p className="text-lg mb-4 text-gray-600"><strong>{suggestion}</strong></p>
        <p className="text-md mb-4 text-gray-600">Thank you for your preapplication. A Peak representative will be in touch soon. If you have any questions regarding your preapplication, contact us at team@peaktcs.com</p>
        <p className="text-center mt-6 text-gray-500 text-sm">
          © {new Date().getFullYear()} PivotOS. All rights reserved.
        </p>
      </div>
    </motion.div>
  );
}