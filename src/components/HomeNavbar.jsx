import React, { useState } from 'react';

export default function HomeNavbar() {
 
  const [isOpen, setIsOpen] = useState(false); 

  return (
    <nav className="flex items-center justify-between px-5 sm:px-10 bg-white sm:shadow-md relative z-10">
      {/* Logo Section */}
      <div className="flex items-center h-[3.5rem] max-w-full">
        <img src="/favicon.png" alt="Website Logo" className="w-[2.75rem] h-[2.75rem]" />
        <p className='pl-5 font-extrabold '>DOGGO</p>
      </div>

      {/* Desktop Menu */}
      <ul className="hidden md:flex flex-row items-center space-x-10">
        <li>
          <a href="#" className="text-sm font-medium">
            Home
          </a>
        </li>
        <li>
          <a href="#" className="text-sm font-medium">
            About
          </a>
        </li>
        <li>
          <a href="#" className="text-sm font-medium">
            Contact Us
          </a>
        </li>
        <li>
          {/* Get Started Button with Custom Hover Effect */}
          <button 
            className="text-sm font-medium text-white rounded-full bg-doggo px-3 py-2 hover:bg-yellow hover:transition duration-300"
          >
            Get Started
          </button>
        </li>
      </ul>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden flex items-center p-2 rounded-md focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Hamburger Icon */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="absolute top-14 left-0 w-full bg-white rounded-lg py-4 flex flex-col space-y-4 items-center md:hidden">
          <li>
            <a href="#" className="text-sm font-medium hover:text-doggo">
              Platform
            </a>
          </li>
          <li>
            <a href="#" className="text-sm font-medium hover:text-doggo">
              Services
            </a>
          </li>
          <li>
            <a href="#" className="text-sm font-medium hover:text-doggo">
              Integration
            </a>
          </li>
          <li>
            {/* Get Started Button with Custom Hover Effect for Mobile */}
            <button 
              className="text-sm font-medium text-white rounded-3xl bg-doggo px-3 py-2 hover:bg-yellow hover:text-white transition duration-300"
            >
              Get Started
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
}