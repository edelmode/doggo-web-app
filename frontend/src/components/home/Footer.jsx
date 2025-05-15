import { useState } from 'react';
import PrivacyPolicy from './PrivacyPolicy';
import {
  ChevronRight,
  Dog,
} from 'lucide-react';

const Footer = () => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const togglePrivacyModal = () => {
    setIsPrivacyOpen((prev) => !prev);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('https://testdockerbackend.azurewebsites.net/api/email/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Subscriber', email }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Subscribed!');
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(result.error || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setMessage('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
      setEmail('');
    }
  };

  return (
    <footer className="bg-footer-background text-black py-5 relative">
      {/* Centered Logo */}
      <div className="flex justify-center mb-8">
        <img src="/logo.png" alt="Logo" className="w-60 h-auto" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-center md:text-left justify-center">
          {/* Quick Links Section */}
          <div className="mb-10 md:ml-10">
            <h4 className="text-lg text-dark-pastel-orange font-bold mb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 flex flex-col font-medium justify-center md:justify-start">
              {[
                { label: 'Home', href: '#home' },
                { label: 'Contact Us', href: '#contact' },
                { label: 'About Us', href: '#about' },
                { label: 'Our Team', href: '#team' },
                { label: 'Privacy Policy', href: '#terms', onClick: togglePrivacyModal },
              ].map(({ label, href, onClick }) => (
                <li key={label}>
                  <div className="flex items-center">
                    <ChevronRight size={16} className="mr-1" />
                    <a
                      href={href}
                      onClick={onClick}
                      className="hover:text-dark-grayish-orange transition duration-300"
                    >
                      {label}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h4
              className="text-lg font-bold mb-2 text-white shadow-md"
              style={{ textShadow: '2px 2px 4px black' }}
            >
              Subscribe to our Newsletter
            </h4>
            <form onSubmit={handleSubscribe} className="relative flex mt-2">
              <div className="flex w-full">
                <div className="relative flex-grow">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="p-2 rounded-l-lg border border-gray-300 pl-10 w-full"
                    required
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Dog size={16} />
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={!!message}
                  className={`w-36 text-white font-bold px-3 py-2 rounded-lg ${
                    message
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-dark-pastel-orange hover:bg-dark-grayish-orange transition duration-300'
                  }`}
                >
                  {message || 'Subscribe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isPrivacyOpen && <PrivacyPolicy togglePrivacyModal={togglePrivacyModal} />}

      {/* Copyright */}
      <div className="mt-8 text-right text-sm text-white mr-10">
        <p>&copy; {new Date().getFullYear()} Doggo. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
