import { Clock, PercentCircle, Car, Laptop, FileCheck2, Users, ShieldCheck, CreditCard, BarChart, Zap } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';


const AboutUs = () => {
  const aboutCards = [
    {
      title: 'Our Goal',
      icon: '🎯',
    color: 'from-drivecash-accent to-drivecash-green',
  content: `At DriveCash, we are here to help borrowers. We do not want your car, we want to help you! We will bend backwards to work with borrowers. We are human, we understand hardships happen and things change. Our goal is to help you secure funds with your title for as long as you need the money and then help you to get your title back.`
    },
    {
  title: 'Our Mission',
  icon: '🚀',
    color: 'from-drivecash-primary to-drivecash-accent',
  content: `Our mission is to help you save money and provide affordable loans quickly. With DriveCash you save money! There is no daily interest added onto your loan, no late fees added when you miss a scheduled payment, no fees at all that do not make sense. Our loans are super easy to understand and meant to help you not entrap you.`
    },
    {
      title: 'Our Company',
      icon: '🏢',
    color: 'from-drivecash-green to-drivecash-accent',
  content: `As DriveCash, we are the best online Title Loan Company in the financial lending industry. With years of experience, we’ve helped individuals and families navigate unexpected financial challenges with ease and confidence. Our commitment to transparency, flexibility, and excellent customer service makes us a reliable solution for your borrowing needs.`
    },
    {
  title: 'DriveCash: The Smarter and Safer Choice For Borrowing',
  icon: '⭐',
    color: 'from-drivecash-accent to-drivecash-primary',
  content: `As Texas’s largest online title loan company, DriveCash serves the community. Get temporary assistance to cover personal, business, medical or household emergencies no matter where you are.`
    },
    {
  title: 'DriveCash in the Community',
    icon: '🤝',
    color: 'from-drivecash-primary to-drivecash-green',
  content: `We believe in giving back. DriveCash is proud to be an active participant in the local community through sponsorships, charitable contributions, and volunteer efforts. We’re committed to making a positive impact beyond lending, supporting initiatives that uplift and strengthen the community we serve.`
    },
    {
  title: 'DriveCash: A Partner You Can Trust',
    icon: '🤗',
    color: 'from-drivecash-green to-drivecash-accent',
  content: `Whenever you need immediate cash and a short-term loan, DriveCash is here to help. Let us give you the financial boost you need with care, expertise, and professionalism. Contact us today!`
    },
  ];

  const benefits = [
    {
      icon: Clock, // Get Money In Three Simple Steps
      title: 'Get Money In Three Simple Steps',
      description: 'Apply online, get pre-approved, and receive a direct deposit in as little as 48 hours.',
    },
    {
      icon: PercentCircle, // No Hidden Fees
      title: 'No Hidden Fees',
  description: 'Transparent terms. No hidden fees, no late fees, and no daily expenses.',
    },
    {
      icon: Car, // Keep Your Vehicle
      title: 'Keep Your Vehicle',
      description: 'Unlock the value of your car and keep driving it while you repay your low interest loan.',
    },
    {
      icon: Laptop, // All Online
      title: 'All Online',
      description: 'Everything is online. No store visits required. Apply from the comfort of your home.',
    },
    {
      icon: FileCheck2, // No Prepayment Penalty
      title: 'No Prepayment Penalty',
      description: 'Pay off your loan early without any additional fees or penalties.',
    },
    {
      icon: Users, // Expert Support
      title: 'Expert Support',
      description: 'Our loan specialists are here to help you every step of the way.',
    }
  ];
  return (
  <section id="aboutus" className="py-20 bg-drivecash-light min-h-screen scroll-mt-16 md:scroll-mt-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
  <h1 className="text-5xl md:text-6xl font-extrabold text-drivecash-primary mb-12 text-center tracking-tight leading-none flex items-center justify-center gap-3">
    <ShieldCheck className="h-10 w-10 text-blue-500 stroke-2" />
    About Us
    <CreditCard className="h-10 w-10 text-blue-500 stroke-2" />
  </h1>
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {aboutCards.map((card) => (
            <SpotlightCard
              key={card.title}
              className={
                `relative bg-drivecash-white rounded-2xl shadow-xl border border-drivecash-light p-8 flex flex-col items-center text-center transition-all duration-300 group hover:shadow-2xl hover:-translate-y-1 animate-fade-in-up overflow-hidden`
              }
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${card.color} pointer-events-none`} />
              <div className="z-10 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-drivecash-accent to-drivecash-green shadow-lg mb-6 border-4 border-drivecash-light text-3xl">
                <span className="text-3xl">{card.icon}</span>
              </div>
              <h2 className="z-10 text-2xl font-bold text-drivecash-accent mb-3 group-hover:text-drivecash-primary transition-colors duration-300">{card.title}</h2>
              <p className="z-10 text-drivecash-dark text-lg leading-relaxed group-hover:text-drivecash-primary transition-colors duration-300 whitespace-pre-line">{card.content}</p>
            </SpotlightCard>
          ))}
        </div>
        {/* Benefits section - improved accessibility */}
        <section
          className="bg-drivecash-white rounded-2xl shadow-2xl p-8 lg:p-12 border border-drivecash-light animate-fade-in-up"
          aria-labelledby="benefits-heading"
          role="region"
        >
          <div className="text-center mb-16">
            <h2 id="benefits-heading" className="text-4xl font-bold text-drivecash-primary mb-4 flex items-center justify-center gap-2">
              <ShieldCheck className="h-8 w-8 text-blue-500 stroke-2" aria-hidden="true" /> Why Choose DriveCash?
            </h2>
            <p className="text-xl text-drivecash-dark max-w-3xl mx-auto">
              We make getting a title loan simple, fast, and transparent. Experience better rates, lower payments, and more savings with DriveCash.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
            {benefits.map((benefit, index) => (
              <SpotlightCard
                key={index}
                className="bg-drivecash-light rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-drivecash-light group relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-drivecash-accent"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br from-drivecash-accent to-drivecash-green pointer-events-none" aria-hidden="true" />
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-drivecash-white mb-6 border-2 border-drivecash-accent shadow-md group-hover:shadow-lg transition-shadow duration-300" aria-hidden="true">
                  <BarChart className="h-6 w-6 text-blue-500 stroke-2" />
                </div>
                <h3 id={`benefit-title-${index}`} className="text-xl font-semibold text-drivecash-primary mb-3 group-hover:text-drivecash-accent transition-colors duration-300">
                  {benefit.title}
                </h3>
                <p className="text-drivecash-dark leading-relaxed group-hover:text-drivecash-primary transition-colors duration-300">{benefit.description}</p>
              </SpotlightCard>
            ))}
          </div>
          <div className="mt-16 bg-drivecash-primary rounded-2xl p-8 lg:p-12 text-center text-drivecash-white shadow-2xl animate-fade-in-up">
            <h3 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <Zap className="h-7 w-7 text-drivecash-green" aria-hidden="true" /> Ready to Get Started?
            </h3>
            <p className="text-xl mb-8 opacity-90">
                  Join thousands of satisfied customers who have chosen DriveCash for their financial needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#apply"
                    className="inline-flex items-center justify-center px-8 py-4 bg-drivecash-accent text-drivecash-white font-bold rounded-full border-2 border-drivecash-accent hover:bg-drivecash-primary hover:text-drivecash-green transition-colors duration-200 shadow-md focus:outline-none focus:ring-4 focus:ring-drivecash-green"
                aria-label="Apply for a title loan"
              >
                Apply Now
              </a>
              <a
                href="#calculator"
                    className="inline-flex items-center justify-center px-8 py-4 border-2 border-drivecash-white text-white font-bold rounded-full bg-transparent hover:bg-drivecash-white hover:text-drivecash-primary transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-drivecash-accent"
                aria-label="Use loan calculator"
              >
                Use Calculator
              </a>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default AboutUs;
