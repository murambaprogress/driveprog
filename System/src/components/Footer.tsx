import React from 'react';
import { tryScrollToId } from '../utils/scroll';
import useSafeNavigate from '../utils/useSafeNavigate';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

const Footer = () => {
  const navigate = useSafeNavigate();

  return (
  <footer id="contact" className="bg-drivecash-primary text-drivecash-white shadow-2xl animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in-up">
          {/* Company Info */}
          <SpotlightCard className="shadow-lg rounded-xl p-6 bg-drivecash-primary/80 backdrop-blur-md bg-clip-padding animate-fade-in-up glassy-card">
            <div className="flex items-center mb-6">
              <span className="text-2xl md:text-3xl font-extrabold text-drivecash-green tracking-tight leading-none">DriveCash</span>
            </div>
            <p className="text-drivecash-light mb-6 leading-relaxed">
              Unlock the value of your car with DriveCash. Apply online for a low interest title loan and receive a direct deposit in as little as 48 hours—all while in your comfort and driving your vehicle!
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-drivecash-light hover:text-drivecash-green transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-drivecash-light hover:text-drivecash-green transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-drivecash-light hover:text-drivecash-green transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-drivecash-light hover:text-drivecash-green transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </SpotlightCard>

          {/* Quick Links */}
          <SpotlightCard className="shadow-lg rounded-xl p-6 bg-drivecash-primary/80 backdrop-blur-md bg-clip-padding animate-fade-in-up glassy-card">
            <h3 className="text-lg font-semibold mb-6 text-drivecash-green">Quick Links</h3>
            <ul className="space-y-3">
              <li><button onClick={() => { if (!tryScrollToId('apply')) navigate('/'); }} className="text-drivecash-light hover:text-drivecash-green transition-colors">Apply Now</button></li>
              <li><button onClick={() => { if (!tryScrollToId('calculator')) navigate('/'); }} className="text-drivecash-light hover:text-drivecash-green transition-colors">Loan Calculator</button></li>
              <li><button data-testid="footer-benefits-btn" onClick={() => { console.log('Footer Benefits clicked, path:', window.location.pathname); const scrolled = tryScrollToId('benefits'); if (!scrolled) { navigate('/benefits'); } }} className="text-drivecash-light hover:text-drivecash-green transition-colors">Benefits</button></li>
              <li><button onClick={() => { if (!tryScrollToId('faq')) navigate('/'); }} className="text-drivecash-light hover:text-drivecash-green transition-colors">FAQ</button></li>
              <li><button onClick={() => navigate('/aboutus')} className="text-drivecash-light hover:text-drivecash-green transition-colors">About Us</button></li>
              <li><button onClick={() => { if (!tryScrollToId('contact')) navigate('/'); }} className="text-drivecash-light hover:text-drivecash-green transition-colors">Contact</button></li>
            </ul>
          </SpotlightCard>

          {/* Legal */}
          <SpotlightCard className="shadow-lg rounded-xl p-6 bg-drivecash-primary/80 backdrop-blur-md bg-clip-padding animate-fade-in-up glassy-card">
            <h3 className="text-lg font-semibold mb-6 text-drivecash-green">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-drivecash-light hover:text-drivecash-green transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-drivecash-light hover:text-drivecash-green transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-drivecash-light hover:text-drivecash-green transition-colors">Responsible Lending</a></li>
              <li><a href="#" className="text-drivecash-light hover:text-drivecash-green transition-colors">State Regulations</a></li>
              <li><a href="#" className="text-drivecash-light hover:text-drivecash-green transition-colors">Complaints Process</a></li>
              <li><a href="#" className="text-drivecash-light hover:text-drivecash-green transition-colors">Accessibility</a></li>
            </ul>
          </SpotlightCard>

          {/* Contact */}
          <SpotlightCard className="shadow-lg rounded-xl p-6 bg-drivecash-primary/80 backdrop-blur-md bg-clip-padding animate-fade-in-up glassy-card">
            <h3 className="text-lg font-semibold mb-6 text-drivecash-green">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-drivecash-green mr-3" />
                <span className="text-drivecash-light">1-800-555-0123</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-drivecash-green mr-3" />
                <span className="text-drivecash-light">info@drivecash.com</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-drivecash-green mr-3 mt-0.5" />
                <span className="text-drivecash-light">
                  123 Financial Street<br />
                  Suite 456<br />
                  Dallas, TX 75201
                </span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-drivecash-light">
                Licensed and regulated in 25 states
              </p>
            </div>
          </SpotlightCard>
        </div>

        {/* Bottom Bar */}
  <div className="border-t border-drivecash-light mt-12 pt-8 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row justify-between items-center">
      <p className="text-drivecash-light text-sm mb-4 lg:mb-0">
        ©Market.Maker.softwares {new Date().getFullYear()} DriveCash. All rights reserved.
      </p>
      <div className="flex flex-wrap gap-6 text-sm text-drivecash-light">
              <span>Equal Housing Lender</span>
              <span>NMLS #123456</span>
              <span>BBB Accredited A+</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;