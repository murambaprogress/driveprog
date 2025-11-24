import React, { useEffect, useRef, useState } from 'react';

const Hero = () => {
  return (
  <section className="bg-drivecash-primary pt-20 pb-24 min-h-[70vh] flex items-center">
      <div className="max-w-7xl w-full mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        {/* Left: Text */}
  <div className="flex-1 min-w-0 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center mb-4">
            <span className="inline-block mr-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" fill="#22d3ee"/></svg>
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl leading-tight mb-4 font-extrabold text-center md:text-left">
            <span className="text-white">No Hidden Fees, No</span><br />
            <span className="text-drivecash-green">Late Fees &amp; No Daily Interest</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl">
            Unlock the value of your car with DriveCash - Apply now for a transparent, affordable title loan with no hidden fees, no late fees, and no daily interest. Receive funds in as little as 48 hours while keeping your vehicle!
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-10">
            <span className="flex items-center gap-2 bg-[#1e4fc2] text-white text-base font-medium rounded-full px-6 py-3 shadow-md">
              <span className="inline-block w-3 h-3 rounded-full bg-drivecash-green mr-2"></span>
              No Hidden Fees
            </span>
            <span className="flex items-center gap-2 bg-[#1e4fc2] text-white text-base font-medium rounded-full px-6 py-3 shadow-md">
              <span className="inline-block w-3 h-3 rounded-full bg-drivecash-green mr-2"></span>
              No Late Fees
            </span>
            <span className="flex items-center gap-2 bg-[#1e4fc2] text-white text-base font-medium rounded-full px-6 py-3 shadow-md">
              <span className="inline-block w-3 h-3 rounded-full bg-drivecash-green mr-2"></span>
              Texas's Largest Online Lender
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a 
              href="#apply" 
              className="inline-flex items-center px-8 py-4 bg-drivecash-green text-drivecash-primary text-lg font-bold rounded-full border-2 border-drivecash-green hover:bg-drivecash-primary hover:text-white transition-colors duration-200 shadow-md"
            >
              Apply Now
            </a>
          </div>
        </div>
        {/* Right: Car Image */}
        <div className="flex-1 min-w-0 flex justify-center items-center">
          {/* Auto Carousel */}
          {(() => {
            const images = [
              '/car title loans car title loans by.jpeg',
              '/create new account page.jpeg',
              '/login into account page .jpeg',
              '/phone verification.jpeg',
              '/save your progress.jpeg',
              '/services-car title loan types-homepage.jpeg',
              '/titleloan buyout.jpeg',
              '/value of car.jpeg',
              '/what we offer .jpeg',
              '/your estimate .jpeg',
            ];
            function Carousel() {
              const [index, setIndex] = useState(0);
              const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
              useEffect(() => {
                timeoutRef.current = setTimeout(() => {
                  setIndex((prev) => (prev + 1) % images.length);
                }, 3500);
                return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
              }, [index]);
              return (
                <div className="relative w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl h-48 sm:h-64 md:h-[350px] lg:h-[450px] flex items-center justify-center">
                      {images.map((src, i) => {
                        const url = encodeURI(src.trim());
                        return (
                          <img
                            key={src}
                            src={url}
                            alt={src.split('/').pop()?.trim()}
                            className={`absolute top-0 left-0 w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-drivecash-light transition-opacity duration-700 ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                            style={{maxHeight: '100%', minHeight: '100%', minWidth: '100%'}}
                            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/600x400?text=No+Image'; }}
                          />
                        );
                      })}
                  {/* Carousel indicators */}
                    <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, i) => (
                      <span key={i} className={`block w-2 h-2 sm:w-3 sm:h-3 rounded-full ${i === index ? 'bg-drivecash-green' : 'bg-white/60'} border border-drivecash-green`}></span>
                    ))}
                  </div>
                </div>
              );
            }
            return <Carousel />;
          })()}
        </div>
      </div>
    </section>
  );
};

export default Hero;