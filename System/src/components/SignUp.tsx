
import { useState } from 'react';

interface SignUpProps {
  onAuthSuccess?: (isAdmin: boolean) => void;
  preselectedRole?: 'user' | 'admin' | null;
}

const SignUp: React.FC<SignUpProps> = ({ onAuthSuccess, preselectedRole = null }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call for sign up
    await new Promise(res => setTimeout(res, 900));
  setLoading(false);
  // Always treat as user (not admin) after signup
  onAuthSuccess?.(false);
  };

  return (
  <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-drivecash-blue font-sans">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: 'url(/defender.jpg)' }}
  onError={e => { e.currentTarget.style.backgroundImage = 'url(https://placehold.co/600x400?text=No+Image)'; }}
      >
  <div className="absolute inset-0 bg-drivecash-blue mix-blend-multiply"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-6">
            <div className="space-y-4 bg-black/20 backdrop-blur-md rounded-2xl p-6 shadow-lg max-w-lg">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow text-drivecash-primary">
                DriveCash <span className="block text-white text-2xl md:text-3xl font-semibold mt-2">The smarter, safer choice.</span>
              </h1>
              <p className="text-xl text-white max-w-lg">
                Create your account to access Texas-based car loans with competitive rates and flexible terms.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-base bg-black/40 backdrop-blur-md rounded-2xl p-4 shadow-lg max-w-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-drivecash-accent rounded-full"></div>
                <span className="text-drivecash-accent font-semibold">Fast Approval</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-drivecash-primary rounded-full"></div>
                <span className="text-drivecash-primary font-semibold">Competitive Rates</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-drivecash-accent rounded-full"></div>
                <span className="text-drivecash-accent font-semibold">Texas Local</span>
              </div>
            </div>
          </div>
          {/* Right Side - Sign Up Form */}
          <div className="flex justify-center lg:justify-end">
            <form className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6 w-full max-w-sm" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.37)'}} onSubmit={handleSubmit}>
              <h2 className="text-2xl font-extrabold text-white mb-6 text-center tracking-tight">Create Your Account</h2>
              <div className="grid gap-3 mb-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="firstName" className="text-white text-sm font-semibold">First Name</label>
                  <input id="firstName" name="firstName" type="text" placeholder="First Name" value={formData.firstName} onChange={handleChange} required className="px-4 py-2 border border-drivecash-accent/40 rounded-xl bg-drivecash-light focus:ring-2 focus:ring-drivecash-green outline-none transition placeholder:text-drivecash-dark/70 text-drivecash-dark" />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="lastName" className="text-white text-sm font-semibold">Last Name</label>
                  <input id="lastName" name="lastName" type="text" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required className="px-4 py-2 border border-drivecash-accent/40 rounded-xl bg-drivecash-light focus:ring-2 focus:ring-drivecash-green outline-none transition placeholder:text-drivecash-dark/70 text-drivecash-dark" />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="email" className="text-white text-sm font-semibold">Email</label>
                  <input id="email" name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="px-4 py-2 border border-drivecash-accent/40 rounded-xl bg-drivecash-light focus:ring-2 focus:ring-drivecash-green outline-none transition placeholder:text-drivecash-dark/70 text-drivecash-dark" />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="phone" className="text-white text-sm font-semibold">Phone Number</label>
                  <input id="phone" name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required className="px-4 py-2 border border-drivecash-accent/40 rounded-xl bg-drivecash-light focus:ring-2 focus:ring-drivecash-green outline-none transition placeholder:text-drivecash-dark/70 text-drivecash-dark" />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="password" className="text-white text-sm font-semibold">Password</label>
                  <input id="password" name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="px-4 py-2 border border-drivecash-accent/40 rounded-xl bg-drivecash-light focus:ring-2 focus:ring-drivecash-green outline-none transition placeholder:text-drivecash-dark/70 text-drivecash-dark" />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="confirmPassword" className="text-white text-sm font-semibold">Confirm Password</label>
                  <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required className="px-4 py-2 border border-drivecash-accent/40 rounded-xl bg-drivecash-light focus:ring-2 focus:ring-drivecash-green outline-none transition placeholder:text-drivecash-dark/70 text-drivecash-dark" />
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-2 border-2 border-blue-500 text-blue-500 font-bold rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-200"
              >
                {loading ? <span className="text-blue-500">Creating Account...</span> : <span className="text-blue-500">Create Account</span>}
              </button>
              <p className="text-center text-sm mt-4 text-white">Already have an account? <a href="http://localhost:3000/" className="text-drivecash-green font-semibold underline underline-offset-2">Login</a></p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
