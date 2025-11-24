import React, { useState } from 'react';
import { Mail, MessageCircle } from 'lucide-react';

const Support: React.FC = () => {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
  <h2 className="text-3xl font-bold text-drivecash-blue mb-2">Support</h2>
  <p className="text-drivecash-gray">Contact our support team for help</p>
      </div>
      <div className="bg-white/30 backdrop-blur-md rounded-xl p-8 border border-white/10 shadow-lg max-w-lg mx-auto">
        <form onSubmit={handleSend} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-drivecash-gray mb-2">Your Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4} className="w-full border border-drivecash-blue/30 rounded-lg px-3 py-2" placeholder="Type your message..." />
          </div>
          <button type="submit" className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow hover:opacity-95 transition flex items-center justify-center gap-2">
            <Mail className="w-5 h-5" />Send Message
          </button>
          {sent && <div className="text-green-600 text-center font-semibold flex items-center justify-center gap-2 mt-2"><MessageCircle className="w-4 h-4" />Message sent!</div>}
        </form>
      </div>
    </div>
  );
};

export default Support;
