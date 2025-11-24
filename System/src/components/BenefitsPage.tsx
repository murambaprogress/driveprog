import React from 'react';
import Benefits from './Benefits';



const BenefitsPage = () => (
  <main className="relative min-h-screen bg-drivecash-light py-12 overflow-hidden">
    {/* Faint background image */}
    <img 
      src={encodeURI('/save your progress.jpeg'.trim())} 
      alt="Save Your Progress" 
      className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover opacity-10 z-0" 
      aria-hidden="true"
      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/1200x600?text=No+Image'; }}
    />
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
  <h1 className="text-5xl md:text-6xl font-extrabold text-drivecash-primary mb-10 text-center tracking-tight leading-none">Why Choose DriveCash?</h1>
      <Benefits />
    </div>
  </main>
);

export default BenefitsPage;
