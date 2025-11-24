import useSafeNavigate from '../utils/useSafeNavigate';
import { tryScrollToId } from '../utils/scroll';
import { TrendingUp, DollarSign, Monitor, Car, Ban, Headphones, Zap, ShieldCheck } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

const Benefits = () => {
  const navigate = useSafeNavigate();
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Get Money In Three Simple Steps',
      description: 'Apply online, get pre-approved, and receive a direct deposit in as little as 48 hours.',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      icon: DollarSign,
      title: 'No Hidden Fees',
  description: 'Transparent terms. No hidden fees, no late fees, and no daily expenses.',
      color: 'text-pink-600 bg-pink-100'
    },
    {
      icon: Car,
      title: 'Keep Your Vehicle',
      description: 'Unlock the value of your car and keep driving it while you repay your low interest loan. Maintain your car in good condition.',
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      icon: Monitor,
      title: 'All Online',
      description: 'Everything is online. No store visits required. Apply from the comfort of your home.',
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      icon: Ban,
      title: 'No Prepayment Penalty',
      description: 'Pay off your loan early without any additional fees or penalties.',
      color: 'text-orange-600 bg-orange-100'
    },
    {
      icon: Headphones,
      title: 'Expert Support',
      description: 'Our loan specialists are here to help you every step of the way.',
      color: 'text-blue-600 bg-blue-100'
    }
  ];

  return (
  <section id="benefits" className="py-20 bg-drivecash-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold text-drivecash-primary mb-4 flex items-center justify-center gap-2">
            <ShieldCheck className="h-8 w-8 text-blue-500 stroke-2" /> Why Choose DriveCash?
          </h2>
          <p className="text-xl text-drivecash-dark max-w-3xl mx-auto">
            We make getting a title loan simple, fast, and transparent. Experience better rates, lower payments, and more savings with DriveCash.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <SpotlightCard
                key={index}
                className="bg-drivecash-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-drivecash-light group relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br from-drivecash-accent to-drivecash-green pointer-events-none" />
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-6 border-2 border-drivecash-accent shadow-md group-hover:shadow-lg transition-shadow duration-300"
                  style={{ backgroundColor: benefit.color.split(' ')[1]?.replace('bg-', '') || '#f3f4f6' }}>
                  <IconComponent className={`h-7 w-7 ${benefit.color.split(' ')[0]}`} />
                </div>
                <h3 className="text-xl font-semibold text-drivecash-primary mb-3 group-hover:text-drivecash-accent transition-colors duration-300">{benefit.title}</h3>
                <p className="text-drivecash-dark leading-relaxed group-hover:text-drivecash-primary transition-colors duration-300">{benefit.description}</p>
              </SpotlightCard>
            );
          })}
        </div>

  <div className="mt-16 bg-drivecash-primary rounded-2xl p-8 lg:p-12 text-center text-drivecash-white shadow-2xl animate-fade-in-up">
          <h3 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <Zap className="h-7 w-7 text-drivecash-green" /> Ready to Get Started?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers who have chosen DriveCash for their financial needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => { if (!tryScrollToId('apply')) navigate('/'); }}
              className="inline-flex items-center justify-center px-8 py-4 bg-drivecash-accent text-drivecash-white font-bold rounded-full border-2 border-drivecash-accent hover:bg-drivecash-primary hover:text-drivecash-green transition-colors duration-200 shadow-md"
            >
              Apply Now
            </button>
            <button
              onClick={() => { if (!tryScrollToId('calculator')) navigate('/'); }}
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-drivecash-white text-drivecash-white font-bold rounded-full hover:bg-drivecash-white hover:text-drivecash-primary transition-colors duration-200"
            >
              Use Calculator
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;