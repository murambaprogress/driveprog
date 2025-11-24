import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { tryScrollToId } from "../utils/scroll";
import useSessionTimer from "../utils/sessionTimer";
import RoleToggle from "./RoleToggle";
import { useToast } from "./ToastProvider";

interface HeaderProps {
  currentRole?: "user" | "admin" | null;
  onRoleChange?: (isAdmin: boolean) => void;
  showRoleToggle?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  currentRole = null,
  onRoleChange,
  showRoleToggle = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { msRemaining, extendSession } = useSessionTimer(1000);
  const toast = useToast();
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [lastExtendedAt, setLastExtendedAt] = useState<number>(0);
  const [autoExtendEnabled] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem("drivecash_auto_extend");
      return v === null ? true : v === "true";
    } catch {
      return true;
    }
  });

  // Navigation handlers
  const handleScrollOrNavigate = (id: string) => {
    if (location.pathname === "/") {
      const scrolled = tryScrollToId(id);
      if (!scrolled) {
        if (id === "aboutus") navigate("/aboutus");
        else if (id === "benefits") navigate("/benefits");
      }
    } else {
      if (id === "aboutus") navigate("/aboutus");
      else if (id === "benefits") navigate("/benefits");
      else navigate("/");
    }
    setIsMenuOpen(false);
  };

  const goToLogin = () => {
    setIsMenuOpen(false);
    // Use internal login route to keep everything on the same port
    const loginUrl = "/login";
    console.log("Redirecting to login URL:", loginUrl);
    window.location.href = loginUrl;
  };
  const goToBenefits = () => {
    setIsMenuOpen(false);
    navigate("/benefits");
  };

  // Session timer effect (if needed)
  useEffect(() => {
    const onActivity = () => {
      setLastExtendedAt(Date.now());
      // only auto-extend if remaining time is less than 5 minutes (to ensure 5m minimum)
      if (autoExtendEnabled && msRemaining < 5 * 60 * 1000) {
        extendSession(5);
        // don't display the auto-extend toast to keep UX silent
      }
    };
    window.addEventListener("mousemove", onActivity);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("click", onActivity);
    window.addEventListener("touchstart", onActivity);
    return () => {
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("click", onActivity);
      window.removeEventListener("touchstart", onActivity);
    };
  }, [msRemaining, lastExtendedAt, extendSession, toast, autoExtendEnabled]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300`}
      aria-label="Main header"
    >
      {/* Liquid glass background shell (no white border line) */}
      <div
        className={`relative mx-4 my-2 rounded-2xl overflow-hidden bg-white/6 backdrop-blur-xl backdrop-saturate-150 shadow-lg transition-colors duration-300`}
      >
        {/* animated sheen and subtle gradient */}
        <style>{`
          .liquid-sheen { position: absolute; left: -40%; top: -30%; width: 60%; height: 120%; transform: rotate(25deg); background: linear-gradient(90deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0) 100%); opacity: 0.6; filter: blur(18px); }
          @keyframes sheenMove { 0% { transform: translateX(-220%) rotate(25deg); } 100% { transform: translateX(220%) rotate(25deg); } }
          .animate-sheen { animation: sheenMove 6.5s linear infinite; }
          /* subtle inner border stroke to emphasize glass edge */
          .glass-inner { box-shadow: inset 0 1px 0 rgba(255,255,255,0.06); }
          /* keep an outer shadow visible at all times, add inset shadow when pressed */
          /* stronger visible outer shadow for better contrast on glass */
          /* stronger visible outer shadow for better contrast on glass */
          /* amplified outer shadow for higher visibility */
          .btn-always-shadow { box-shadow: 0 18px 46px rgba(2,6,23,0.24); transition: box-shadow 220ms cubic-bezier(.15,.9,.2,1), transform 120ms ease; }
          .btn-always-shadow:hover { box-shadow: 0 34px 80px rgba(2,6,23,0.28); }
          .btn-always-shadow:active { box-shadow: 0 34px 80px rgba(2,6,23,0.28), inset 0 14px 36px rgba(2,6,23,0.36); transform: translateY(0.8px); }
        `}</style>
        <div className="liquid-sheen animate-sheen pointer-events-none aria-hidden" />
        <div className="glass-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex flex-col items-start justify-center">
                <Link
                  to="/"
                  className="text-3xl md:text-4xl font-extrabold text-drivecash-primary focus:outline-none focus:ring-2 focus:ring-drivecash-accent tracking-tight leading-none"
                  tabIndex={0}
                  style={{ letterSpacing: "0.01em" }}
                >
                  DriveCash
                </Link>
                <span
                  className="block text-drivecash-blue-200 text-xs md:text-sm font-medium mt-1 tracking-wide"
                  style={{ fontFamily: "Sweet Crumble, cursive" }}
                >
                  The smarter, safer choice.
                </span>
              </div>
              <nav className="hidden md:flex space-x-8 items-center">
                <button
                  onClick={() => handleScrollOrNavigate("apply")}
                  className="text-blue-900 hover:text-drivecash-primary font-medium transition-colors bg-transparent"
                >
                  Apply Now
                </button>
                <button
                  onClick={() => handleScrollOrNavigate("calculator")}
                  className="text-blue-900 hover:text-drivecash-primary font-medium transition-colors bg-transparent"
                >
                  Calculator
                </button>
                <button
                  data-testid="header-benefits-btn"
                  onClick={goToBenefits}
                  className="text-blue-900 hover:text-drivecash-primary font-medium transition-colors bg-transparent"
                >
                  Benefits
                </button>
                <button
                  onClick={() => handleScrollOrNavigate("aboutus")}
                  className="text-blue-900 hover:text-drivecash-primary font-medium transition-colors bg-transparent"
                >
                  About Us
                </button>
                <button
                  onClick={() => handleScrollOrNavigate("faq")}
                  className="text-blue-900 hover:text-drivecash-primary font-medium transition-colors bg-transparent"
                >
                  FAQ
                </button>
                <button
                  onClick={() => handleScrollOrNavigate("contact")}
                  className="text-blue-900 hover:text-drivecash-primary font-medium transition-colors bg-transparent"
                >
                  Contact
                </button>

                {/* Role toggle removed - buttons are hidden/removed per UX request */}

                <button
                  data-testid="header-login-btn"
                  onClick={goToLogin}
                  className="ml-4 px-6 py-2 text-blue-900 font-semibold rounded-full bg-transparent hover:bg-drivecash-primary/10 btn-always-shadow focus:outline-none"
                >
                  Login
                </button>
              </nav>
              <button
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
            {isMenuOpen && (
              <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  <button
                    onClick={() => {
                      handleScrollOrNavigate("apply");
                    }}
                    className="block px-3 py-2 text-blue-900 hover:text-drivecash-primary w-full text-left bg-transparent"
                  >
                    Apply Now
                  </button>
                  <button
                    onClick={() => {
                      handleScrollOrNavigate("calculator");
                    }}
                    className="block px-3 py-2 text-blue-900 hover:text-drivecash-primary w-full text-left bg-transparent"
                  >
                    Calculator
                  </button>
                  <button
                    data-testid="header-mobile-benefits-btn"
                    onClick={goToBenefits}
                    className="block px-3 py-2 text-blue-900 hover:text-drivecash-primary"
                  >
                    Benefits
                  </button>
                  <button
                    onClick={() => {
                      handleScrollOrNavigate("aboutus");
                    }}
                    className="block px-3 py-2 text-blue-900 hover:text-drivecash-primary"
                  >
                    About Us
                  </button>
                  <button
                    onClick={() => {
                      handleScrollOrNavigate("faq");
                    }}
                    className="block px-3 py-2 text-blue-900 hover:text-drivecash-primary"
                  >
                    FAQ
                  </button>
                  <button
                    onClick={() => {
                      handleScrollOrNavigate("contact");
                    }}
                    className="block px-3 py-2 text-blue-900 hover:text-drivecash-primary"
                  >
                    Contact
                  </button>

                  {/* Mobile Role Toggle */}
                  {showRoleToggle && onRoleChange && (
                    <div className="px-3 py-2">
                      <RoleToggle
                        currentRole={currentRole}
                        onRoleChange={onRoleChange}
                      />
                    </div>
                  )}

                  <button
                    data-testid="header-mobile-login-btn"
                    onClick={goToLogin}
                    className="block px-3 py-2 text-blue-900 font-bold bg-transparent hover:bg-drivecash-primary/10 rounded-full btn-always-shadow focus:outline-none"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}
            {showExpiryModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                  <h3 className="text-lg font-semibold mb-2">
                    Session expiring soon
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Your session will expire in under a minute. Extend for
                    another 5 minutes?
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowExpiryModal(false);
                      }}
                      className="px-4 py-2 rounded bg-gray-100"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => {
                        extendSession(5);
                        setShowExpiryModal(false);
                        toast.push("Session extended 5 minutes", "success");
                      }}
                      className="px-4 py-2 rounded bg-blue-600 text-white"
                    >
                      Extend
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
