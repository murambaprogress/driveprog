import { useEffect, useState } from "react";
import useSafeNavigate from "../utils/useSafeNavigate";
import ApplicationForm from "./ApplicationForm";

const UserPortal = () => {
  const [showPending, setShowPending] = useState(false);
  const [showAppForm, setShowAppForm] = useState(false);

  useEffect(() => {
    // Check if user just completed sign up with a pending application
    const justSignedUp = sessionStorage.getItem("justSignedUpWithLoan");
    if (justSignedUp) {
      setShowPending(true);
      sessionStorage.removeItem("justSignedUpWithLoan");
    }
  }, []);

  const navigate = useSafeNavigate();
  // name handled by AccountHeader

  return (
    <div className="min-h-screen bg-gradient-to-br from-drivecash-light via-white to-drivecash-accent/10">
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          {/* ...existing code... */}
          <h1 className="text-4xl font-extrabold text-drivecash-primary mb-8 tracking-tight drop-shadow">
            Welcome to Your Portal
          </h1>
          {showPending && (
            <div className="mb-8 p-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 rounded-xl shadow animate-fade-in-up">
              <h2 className="text-2xl font-bold mb-2">
                Loan Application Submitted
              </h2>
              <p>
                Your loan application is pending approval. You will be notified
                here once a decision is made. Thank you for applying!
              </p>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="backdrop-blur-lg bg-white/70 border border-drivecash-accent/30 shadow-xl rounded-3xl p-8">
              <h2 className="text-2xl font-semibold text-drivecash-green mb-4">
                Apply for a Loan
              </h2>
              <p className="mb-4">
                Start a new loan application or check your eligibility.
              </p>
              <button
                onClick={() => setShowAppForm(true)}
                className="inline-block bg-drivecash-green/90 text-white font-bold px-6 py-3 rounded-xl shadow hover:bg-drivecash-primary transition"
              >
                Apply Now
              </button>
            </div>
            <div className="backdrop-blur-lg bg-white/70 border border-drivecash-accent/30 shadow-xl rounded-3xl p-8">
              <h2 className="text-2xl font-semibold text-drivecash-green mb-4">
                Your Loans
              </h2>
              <p className="mb-4">
                View, check status, or pay back your existing loans.
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-block bg-drivecash-green/90 text-white font-bold px-6 py-3 rounded-xl shadow hover:bg-drivecash-primary transition"
              >
                View Loans
              </button>
            </div>
          </div>
          <div className="mt-12 backdrop-blur-lg bg-white/70 border border-drivecash-accent/30 shadow-xl rounded-3xl p-8">
            <h2 className="text-2xl font-semibold text-drivecash-green mb-4">
              Notifications & Reminders
            </h2>
            <p>
              Real-time notifications and reminders about your loans, payments,
              and important updates will appear here.
            </p>
          </div>
        </div>
      </section>
      {showAppForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-5xl mx-auto">
            <button
              onClick={() => setShowAppForm(false)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow hover:bg-drivecash-accent/20 transition"
              aria-label="Close"
              title="Close"
            >
              <span className="text-2xl">&times;</span>
            </button>
            <ApplicationForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPortal;
