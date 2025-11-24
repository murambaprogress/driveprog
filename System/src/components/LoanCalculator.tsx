import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Zap, PiggyBank, PercentCircle, BarChart, ShieldCheck, HandCoins, CreditCard, FileSignature } from 'lucide-react';

const LoanCalculator = () => {
  // Vehicle makes and models (sample, can be expanded)
  const vehicleData: { [make: string]: string[] } = {
    Toyota: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', 'Prius'],
    Ford: ['F-150', 'Escape', 'Explorer', 'Fusion', 'Mustang', 'Edge'],
    Honda: ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey', 'Fit'],
    Chevrolet: ['Silverado', 'Equinox', 'Malibu', 'Tahoe', 'Traverse', 'Camaro'],
    Nissan: ['Altima', 'Sentra', 'Rogue', 'Versa', 'Pathfinder', 'Frontier'],
    Hyundai: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Accent', 'Kona'],
    Kia: ['Optima', 'Sorento', 'Soul', 'Sportage', 'Forte', 'Rio'],
    GMC: ['Sierra', 'Terrain', 'Acadia', 'Canyon', 'Yukon'],
    Dodge: ['Ram', 'Charger', 'Durango', 'Challenger', 'Journey'],
    Jeep: ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade'],
    Volkswagen: ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf'],
    Subaru: ['Outback', 'Forester', 'Impreza', 'Crosstrek', 'Legacy'],
    BMW: ['3 Series', '5 Series', 'X3', 'X5', '4 Series'],
    Mercedes: ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
    Lexus: ['RX', 'ES', 'NX', 'IS', 'GX'],
    Other: ['Other']
  };

  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');

  const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMake(e.target.value);
    setSelectedModel('');
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVehicleYear(e.target.value);
  };
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [loanAmount, setLoanAmount] = useState(0);
  const [interestRate, setInterestRate] = useState(11.5);
  const [termMonths, setTermMonths] = useState(36);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const monthlyRate = interestRate / 100 / 12;
    const payment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                   (Math.pow(1 + monthlyRate, termMonths) - 1);
    const total = payment * termMonths;
    const interest = total - loanAmount;
    setMonthlyPayment(isFinite(payment) ? payment : 0);
    setTotalInterest(isFinite(interest) ? interest : 0);
  }, [loanAmount, interestRate, termMonths]);

  // Placeholder: Simulate fetching market price from an API
  const fetchMarketPrice = async () => {
    setFetching(true);
    setFetchError('');
    setMarketPrice(null);
    setLoanAmount(0);
    try {
      // Simulate API delay
      await new Promise(res => setTimeout(res, 1200));
      // Simulate market price based on make/model/year
      if (!selectedMake || !selectedModel || !vehicleYear) throw new Error('Please select make, model, and year.');
      // Simple mock: newer cars are worth more, luxury brands higher
      let base = 8000;
      if (["BMW","Mercedes","Lexus"].includes(selectedMake)) base = 20000;
      if (Number(vehicleYear) >= 2022) base += 8000;
      else if (Number(vehicleYear) >= 2018) base += 4000;
      else if (Number(vehicleYear) >= 2012) base += 2000;
      else if (Number(vehicleYear) < 2005) base -= 2000;
      // Add a little randomization
      const price = Math.max(2000, base + Math.floor(Math.random() * 4000));
      setMarketPrice(price);
  setLoanAmount(Math.min(25000, Math.floor(price * 0.5)));
    } catch {
      // Error handling (optional: show toast or alert)
    } finally {
      setFetching(false);
    }
  };

  return (
  <section id="calculator" className="py-20 bg-drivecash-light scroll-mt-16 md:scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-drivecash-primary mb-4 flex items-center justify-center gap-2">
            <PiggyBank className="h-8 w-8 text-blue-500 stroke-2" /> Turn Your Vehicle Into Instant Money - Cash Loans up to $25,000
          </h2>
          <p className="text-xl text-drivecash-dark">
            Get a loan based on your vehicle's value without selling it. Our flexible repayment options let you access the cash you need with a little peace of mind.
          </p>
        </div>

        {/* Loan Qualification Estimation Section */}
  <div className="bg-drivecash-white rounded-2xl p-8 shadow-2xl border border-drivecash-light mb-12 flex flex-col md:flex-row gap-8 items-center">
          <img src={encodeURI('/value of car.jpeg'.trim())} alt="Value of Car" className="w-64 h-40 object-cover rounded-xl shadow-md" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/256x160?text=No+Image'; }} />
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-drivecash-primary mb-2 flex items-center gap-2"><PercentCircle className="h-6 w-6 text-blue-500 stroke-2" /> Estimate Your Loan Qualification</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Vehicle Make Dropdown */}
              <select
                className="px-4 py-3 border border-drivecash-accent/30 rounded-lg focus:ring-2 focus:ring-drivecash-accent focus:border-drivecash-accent"
                value={selectedMake}
                onChange={handleMakeChange}
              >
                <option value="" disabled>Select Make</option>
                {Object.keys(vehicleData).map((make) => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
              {/* Vehicle Model Dropdown */}
              <select
                className="px-4 py-3 border border-drivecash-accent/30 rounded-lg focus:ring-2 focus:ring-drivecash-accent focus:border-drivecash-accent"
                value={selectedModel}
                onChange={handleModelChange}
                disabled={!selectedMake}
              >
                <option value="" disabled>{selectedMake ? 'Select Model' : 'Select Make First'}</option>
                {selectedMake && vehicleData[selectedMake].map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
              {/* Year Input */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Year"
                className="px-4 py-3 border border-drivecash-accent/30 rounded-lg focus:ring-2 focus:ring-drivecash-accent focus:border-drivecash-accent"
                value={vehicleYear}
                onChange={handleYearChange}
                min="1980"
                max={new Date().getFullYear() + 1}
              />
            </div>
            <button
              type="button"
              className="bg-drivecash-accent text-drivecash-white py-3 px-8 rounded-full font-bold shadow-md border-2 border-drivecash-accent hover:bg-drivecash-primary hover:text-drivecash-green transition-colors duration-200 disabled:opacity-60"
              onClick={fetchMarketPrice}
              disabled={fetching || !selectedMake || !selectedModel || !vehicleYear}
            >
              {fetching ? 'Checking...' : 'Check Qualification'}
            </button>
            <p className="text-sm text-drivecash-dark mt-2">We offer loans strictly on the value of your car. Turn your car into instant cash without selling it. We use your vehicle’s value and condition to offer loans with flexible repayment options.</p>
          </div>
        </div>

        {/* Title Loan Buyout Section */}
  <div className="bg-drivecash-white rounded-2xl p-8 shadow-2xl border border-drivecash-light mb-12 flex flex-col md:flex-row gap-8 items-center">
          <img src={encodeURI('/your estimate .jpeg'.trim())} alt="Your Estimate" className="w-64 h-40 object-cover rounded-xl shadow-md" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/256x160?text=No+Image'; }} />
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-drivecash-primary mb-2 flex items-center gap-2"><BarChart className="h-6 w-6 text-blue-500 stroke-2" /> Better Rates. Lower Payments. More Savings!</h3>
            <p className="text-drivecash-dark mb-4">If you're trapped in a costly loan, we can help! Our Title Loan Buyout allows you to refinance your existing loan with better interest rates and improved repayment terms.</p>
            <button className="px-6 py-2 border-2 border-blue-500 text-blue-500 font-bold rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-200">Apply for a Title Loan Buyout</button>
          </div>
        </div>

        {/* What Sets Us Apart Section */}
  <div className="bg-drivecash-primary rounded-2xl p-8 lg:p-12 text-center text-drivecash-white shadow-2xl animate-fade-in-up mb-12">
            <h3 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <ShieldCheck className="h-7 w-7 text-blue-500 stroke-2" /> What Sets Us Apart
            </h3>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div>
              <h4 className="text-xl font-bold mb-2 flex items-center gap-2"><HandCoins className="h-5 w-5 text-blue-500 stroke-2" /> Lightning Fast Approval</h4>
              <ul className="list-disc ml-6 text-lg">
                <li>Get approved in minutes, not hours. Our streamlined process gets you cash quickly.</li>
                <li>Easy application process</li>
                <li>Instant pre-approval</li>
                <li>Same-day funding available</li>
                <li>24/7 online access</li>
              </ul>
              <a href="#" className="inline-block mt-2 text-drivecash-green underline">Learn More</a>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2 flex items-center gap-2"><PercentCircle className="h-5 w-5 text-blue-500 stroke-2" /> Competitive Rates</h4>
              <ul className="list-disc ml-6 text-lg">
                <li>Lower interest rates than traditional title loan companies. Save money with Voozh.</li>
                <li>No high interest rates</li>
                <li>Flexible repayment</li>
                <li>No daily Interest</li>
                <li>No Late Fees</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-500 stroke-2" /> Keep Your Vehicle</h4>
              <ul className="list-disc ml-6 text-lg">
                <li>Continue driving your car while repaying your loan. No disruption to your daily life.</li>
                <li>Pay On Time</li>
                <li>Do Not Miss Payments</li>
                <li>Communicate Hardships</li>
                <li>Maintain your car in good condition.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Loan Calculator Section (as before, but with updated button text) */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="bg-drivecash-white rounded-2xl p-8 shadow-md border border-drivecash-light">
            <h3 className="flex items-center text-2xl font-semibold text-drivecash-primary mb-6">
              <CreditCard className="h-6 w-6 mr-3 text-blue-500 stroke-2" />
              Apply For A Title Loan
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-drivecash-dark mb-2">
                  Loan Amount: ${loanAmount.toLocaleString()} <span className="text-xs text-drivecash-accent">(Max: $25,000, up to 50% of your car's value)</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="25000"
                  step="100"
                  value={loanAmount}
                  onChange={e => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-drivecash-light rounded-lg appearance-none cursor-pointer accent-drivecash-accent"
                />
                <div className="flex justify-between text-sm text-drivecash-dark mt-1">
                  <span>$0</span>
                  <span>${marketPrice ? marketPrice.toLocaleString() : '25,000'}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-drivecash-dark mb-2">
                  Interest Rate: {interestRate.toFixed(1)}% APR
                </label>
                <select
                  value={interestRate}
                  onChange={e => setInterestRate(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-drivecash-accent/30 rounded-lg focus:ring-2 focus:ring-drivecash-accent focus:border-drivecash-accent transition-all"
                >
                  <option value={11.5}>11.5% (Standard)</option>
                  <option value={8.0}>8.0%</option>
                  <option value={25.0}>25.0%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-drivecash-dark mb-2">
                  Loan Term: {termMonths} months
                </label>
                <select
                  value={termMonths}
                  onChange={e => setTermMonths(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-drivecash-accent/30 rounded-lg focus:ring-2 focus:ring-drivecash-accent focus:border-drivecash-accent transition-all"
                >
                  <option value={12}>12 months</option>
                  <option value={36}>36 months</option>
                  <option value={60}>60 months</option>
                </select>
              </div>
            </div>
          </div>
          <div className="bg-drivecash-white rounded-2xl p-8 shadow-md border border-drivecash-light">
            <h3 className="flex items-center text-2xl font-semibold text-drivecash-primary mb-6">
              <BarChart className="h-6 w-6 mr-3 text-blue-500 stroke-2" />
              Your Loan Summary
            </h3>
            <div className="space-y-6">
              <div className="bg-drivecash-light rounded-xl p-6 shadow-sm flex flex-col items-center">
                <div className="text-center flex flex-col items-center">
                  <DollarSign className="h-8 w-8 text-drivecash-teal mb-2" />
                  <p className="text-sm text-drivecash-dark mb-1">Refinance Amount</p>
                  <p className="text-4xl font-bold text-drivecash-accent">
                    ${monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-drivecash-light rounded-xl p-4 shadow-sm text-center">
                  <p className="text-sm text-drivecash-dark mb-1">Loan Amount</p>
                  <p className="text-xl font-semibold text-drivecash-primary">
                    ${loanAmount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-drivecash-light rounded-xl p-4 shadow-sm text-center">
                  <p className="text-sm text-drivecash-dark mb-1">Total Interest</p>
                  <p className="text-xl font-semibold text-drivecash-primary">
                    ${totalInterest.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
              <div className="bg-drivecash-light rounded-xl p-6 shadow-sm">
                <h4 className="font-semibold text-drivecash-primary mb-3 flex items-center gap-2">
                  <FileSignature className="h-5 w-5 text-blue-500 stroke-2" /> Loan Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-drivecash-dark">Term:</span>
                    <span className="font-medium text-drivecash-primary">{termMonths} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-drivecash-dark">Total Payment:</span>
                    <span className="font-medium text-drivecash-primary">
                      {(monthlyPayment * termMonths).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="w-full px-6 py-2 border-2 border-blue-500 text-blue-500 font-bold rounded-full hover:bg-blue-500 hover:text-white transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Zap className="h-5 w-5 text-blue-500" /> Apply For A Title Loan
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoanCalculator;