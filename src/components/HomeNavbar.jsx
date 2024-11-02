import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomeNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  const handleFetchingButtonClick = () => {
    navigate("/fetching-page");  // Redirect to the Fetching page
  };
  
  
  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else {
      console.error(`Element with id ${id} not found.`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-5 sm:px-10 bg-white shadow-md z-50">
      <div className="flex items-center h-[3.5rem] max-w-full">
        <img src="/favicon.png" alt="Website Logo" className="w-[2.75rem] h-[2.75rem]" />
        <p className="pl-5 font-extrabold">DOGGO</p>
      </div>

      {/* Desktop Menu */}
      <ul className="hidden md:flex flex-row items-center space-x-10">
        <li>
          <a href="#" className="text-sm font-medium" onClick={() => handleScrollTo('home')}>
            Home
          </a>
        </li>
        <li>
          <a href="#" className="text-sm font-medium" onClick={() => handleScrollTo('about')}>
            About Us
          </a>
        </li>
        <li>
          <a href="#" className="text-sm font-medium" onClick={() => handleScrollTo('contact')}>
            Contact Us
          </a>
        </li>
        <li>
          <button 
            className="text-sm font-medium text-white rounded-full bg-doggo px-3 py-2 hover:bg-yellow transition duration-300"
            onClick={handleFetchingButtonClick}>
            Get Started
          </button>
        </li>
      </ul>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden flex items-center p-2 rounded-md focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="absolute top-14 left-0 w-full bg-white rounded-lg py-4 flex flex-col space-y-4 items-center md:hidden">
          <li>
            <a href="#" className="text-sm font-medium" onClick={() => handleScrollTo('home')}>
              Home
            </a>
          </li>
          <li>
            <a href="#" className="text-sm font-medium" onClick={() => handleScrollTo('about')}>
              About Us
            </a>
          </li>
          <li>
            <a href="#" className="text-sm font-medium" onClick={() => handleScrollTo('contact')}>
              Contact Us
            </a>
          </li>
          <li>
            <button className="text-sm font-medium text-white rounded-full bg-doggo px-3 py-2 hover:bg-yellow transition duration-300"
              onClick={handleFetchingButtonClick}>
              Get Started
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
}
