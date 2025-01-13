import { useState } from 'react';
import PrivacyPolicy from './PrivacyPolicy';

const Footer = () => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const togglePrivacyModal = () => {
    setIsPrivacyOpen((prev) => !prev);
  };

  return (
    <footer
      className="bg-footer-background text-black py-5 relative">
      {/* Centered Logo */}
      <div className="flex justify-center mb-8">
        <img 
          src="/logo.png" 
          alt="Logo"
          className="w-60 h-auto" 
        />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          {/* Social Media Icons */}
          <div className='md:ml-10'>
            <h5 className="text-lg text-dark-pastel-orange font-bold mb-4">Follow Us</h5>
            <div className="flex justify-center md:justify-start space-x-4 text-3xl">
              <a href="https://facebook.com" className="hover:text-gray-400 hover:transition duration-300">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://instagram.com" className="hover:text-gray-400 hover:transition duration-300">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://twitter.com" className="hover:text-gray-400 hover:transition duration-300">
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>
          
          {/* Quick Links Section */}
          <div className="mb-10">
            <h4 className="text-lg text-dark-pastel-orange font-bold mb-2">Quick Links</h4>
            <ul className="space-y-2 flex flex-col font-medium justify-center md:justify-start">
              <li>
                <i className="fas fa-arrow-right mr-2"></i>
                <a href="#home" className="hover:text-dark-grayish-orange hover:transition duration-300">Home</a>
              </li>
              <li>
                <i className="fas fa-arrow-right mr-2"></i>
                <a href="#contact" className="hover:text-dark-grayish-orange hover:transition duration-300">Contact Us</a>
              </li>
              <li>
                <i className="fas fa-arrow-right mr-2"></i>
                <a href="#about" className="hover:text-dark-grayish-orange hover:transition duration-300">About Us</a>
              </li>
              <li>
                <i className="fas fa-arrow-right mr-2"></i>
                <a href="#team" className="hover:text-dark-grayish-orange hover:transition duration-300">Our Team</a>
              </li>
              <li>
                <i className="fas fa-arrow-right mr-2"></i>
                <a href="#faqs" className="hover:text-dark-grayish-orange hover:transition duration-300">FAQs</a>
              </li>
              <li>
                <i className="fas fa-arrow-right mr-2"></i>
                <a
                  href="#terms"
                  className="hover:text-dark-grayish-orange hover:transition duration-300"
                  onClick={togglePrivacyModal}
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h4
                className="text-lg font-bold mb-2 text-white"
                style={{
                textShadow: '2px 2px 4px black',
                }}
            >
                Subscribe to our Newsletter
            </h4>
            <div className="relative flex mt-2 justify-center md:justify-start">
              <div className="flex w-full">
                <div className="relative flex-grow">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="p-2 rounded-l-lg border border-gray-300 pl-10 w-full" 
                    required 
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <i className="fas fa-dog"></i>
                  </span>
                </div>
                <button 
                  type="submit" 
                  className="bg-dark-pastel-orange text-white rounded-r-lg px-4 hover:bg-dark-grayish-orange transition"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal */}
      {isPrivacyOpen && <PrivacyPolicy togglePrivacyModal={togglePrivacyModal} />}

      {/* Copyright Section */}
      <div className="mt-8 text-center text-sm text-white">
        <p>&copy; {new Date().getFullYear()} Doggo. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
