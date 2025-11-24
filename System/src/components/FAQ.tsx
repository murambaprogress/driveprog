import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Phone, Mail, PercentCircle, CreditCard, HandCoins } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is a title loan?',
      answer: 'A title loan is a fast and convenient way to access cash using your car as collateral. As long as you own your vehicle and have a lien-free title, you can use it to borrow money you need.'
    },
    {
      question: 'Does my car/vehicle have to be paid off for a loan?',
      answer: 'Yes, your vehicle title must be lien-free, meaning there are no outstanding loans or legal judgments against it. A lien-free title confirms that you own your vehicle outright, which is required to qualify for a title loan.'
    },
    {
      question: 'How much cash can I get with a loan?',
      answer: 'The loan amount depends on the appraised value of your vehicle.'
    },
    {
      question: 'Why choose a title lender for funds?',
  answer: 'Title loans provide a quicker and more straightforward way to obtain cash compared to traditional borrowing options. At DriveCash, you can borrow funds based on your vehicle’s value while continuing to use your car during the loan term.'
    },
    {
      question: 'What do I need for a loan?',
      answer: 'A lien-free vehicle title\nGovernment-issued ID\nProof of income\nYour vehicle for a quick appraisal'
    },
    {
      question: 'Does the title have to be in my name?',
      answer: 'Yes, you must be listed as the legal owner of the vehicle. If there is another person on the title, they must also be part of the application process as a co-signer on the loan.'
    },
    {
      question: 'How do I get my title back?',
  answer: 'Once you’ve paid off your loan, DriveCash will release the lien it puts on your vehicle title. The title will then be processed and returned to you through the state’s department of motor vehicles. DriveCash is committed to providing clear answers and an easy application process.'
    },
    {
      question: 'Can I get a car title loan if I am on disability, social security or collecting unemployment?',
      answer: 'Yes! You do not have to be employed to get a car title loan, but you do have to have a source of verifiable income such as disability, unemployment, retirement income, etc, and enough disposable income to pay off the loan.'
    },
    {
      question: 'Can I get a car title loan if I am self-employed?',
      answer: 'Yes! Because we will need to verify that you have income, our representative will work with you in obtaining the information needed to satisfy the legal verification requirements.'
    },
    {
      question: 'Do I have to have a job to get a car title loan?',
      answer: 'No! You do not need a job, but you must have a verifiable source of income such as disability, unemployment, retirement income, etc.'
    },
    {
      question: 'Do I have to have insurance to get a loan?',
      answer: 'No! Other companies maybe but we don’t!'
    },
    {
      question: 'What if I have bad credit?',
      answer: 'No problem! If you have bad credit it does not matter. Bad credit, no credit or good credit makes no difference – we do not check your credit to get a loan and we do not report your loan to any credit agencies.'
    },
    {
      question: "What if I can't make a payment?",
      answer: 'Life happens. Things happen. We understand that. If you find yourself short one month, call us, we will do everything we can to work with you and your circumstances.'
    }
  ];

  return (
  <section id="faq" className="py-20 bg-drivecash-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-drivecash-white rounded-full mb-6 border-2 border-drivecash-accent">
            <PercentCircle className="h-8 w-8 text-blue-500 stroke-2" />
          </div>
          <h2 className="text-4xl font-bold text-drivecash-primary mb-4 flex items-center justify-center gap-3">
            <PercentCircle className="h-8 w-8 text-blue-500 stroke-2" />
            Frequently Asked Questions
            <CreditCard className="h-8 w-8 text-blue-500 stroke-2" />
          </h2>
          <p className="text-xl text-drivecash-dark">
            Get answers to the most common questions about our title loan process.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <SpotlightCard key={index} className="bg-drivecash-white rounded-lg shadow-lg hover:shadow-2xl overflow-hidden border border-drivecash-light group transition-all duration-300 hover:scale-105 animate-fade-in-up">
              <button
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-drivecash-light transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-drivecash-primary pr-4 group-hover:text-drivecash-accent transition-colors duration-300 flex items-center gap-2">
                  <HandCoins className="h-5 w-5 text-blue-500 stroke-2" />
                  {faq.question}
                </span>
                  {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-drivecash-accent flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-drivecash-dark flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-drivecash-dark leading-relaxed group-hover:text-drivecash-primary transition-colors duration-300">{faq.answer}</p>
                </div>
              )}
            </SpotlightCard>
          ))}
        </div>

  <div className="mt-12 bg-drivecash-white rounded-xl p-8 text-center border border-drivecash-accent shadow-lg animate-fade-in-up">
          <h3 className="text-2xl font-semibold text-drivecash-primary mb-4 flex items-center justify-center gap-2">
            <HelpCircle className="h-6 w-6 text-drivecash-accent" /> Still Have Questions?
          </h3>
          <p className="text-drivecash-dark mb-6">
            Our loan specialists are here to help you understand the process and find the right solution for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:1-800-555-0123" 
              className="inline-flex items-center justify-center px-6 py-3 bg-drivecash-accent text-drivecash-white font-semibold rounded-full border-2 border-drivecash-accent hover:bg-drivecash-primary hover:text-drivecash-green transition-colors duration-200 shadow-md"
            >
              <Phone className="h-5 w-5 mr-2 text-drivecash-green" /> Call (800) 555-0123
            </a>
            <a 
              href="#contact" 
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-drivecash-accent text-drivecash-accent font-semibold rounded-full hover:bg-drivecash-accent hover:text-drivecash-white transition-colors duration-200"
            >
              <Mail className="h-5 w-5 mr-2" /> Contact Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;