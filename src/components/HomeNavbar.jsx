import React, { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';
import ForgotPassword from './ForgotPassword';
import VerificationCard from './VerificationCard';
import ResetPassword from './ResetPasswordCard';
import TermsOfUse from './TermsOfUse';

export default function HomeNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleScrollTo = (id) => {
    event.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      setIsOpen(false);
    } else {
      console.error(`Element with id ${id} not found.`);
    }
  };

  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);
  const [isVerificationOpen, setVerificationOpen] = useState(false);
  const [isResetPass, setResetPassOpen] = useState(false);
  const [isTermsOpen, setTermsOpen] = useState(false);

  const toggleVerificationModal = () => {
      setVerificationOpen(!isVerificationOpen);
      setIsSignInOpen(false);
      setIsSignUpOpen(false);
      setIsForgotPassOpen(false);
      setResetPassOpen(false);
      setTermsOpen(false);
  };

  const toggleResetPassModal = () => {
      setResetPassOpen(!isResetPass);
      setIsSignInOpen(false);
      setIsSignUpOpen(false);
      setIsForgotPassOpen(false);
      setVerificationOpen(false);
      setTermsOpen(false);
  };

  const toggleSignInModal = () => {
      setIsSignInOpen(!isSignInOpen);
      setIsSignUpOpen(false);
      setIsForgotPassOpen(false);
      setVerificationOpen(false);
      setResetPassOpen(false);
      setTermsOpen(false);
  };

  const toggleSignUpModal = () => {
      setIsSignUpOpen(!isSignUpOpen);
      setIsSignInOpen(false);
      setIsForgotPassOpen(false);
      setVerificationOpen(false);
      setResetPassOpen(false);
      setTermsOpen(false);
  };

  const toggleForgotPassModal = () => {
      setIsForgotPassOpen(!isForgotPassOpen);
      setIsSignInOpen(false);
      setIsSignUpOpen(false);
      setVerificationOpen(false);
      setResetPassOpen(false);
      setTermsOpen(false);
  };

  const toggleTermsModal = () => {
      setTermsOpen(!isTermsOpen);
      setIsForgotPassOpen(false);
      setIsSignInOpen(false);
      setIsSignUpOpen(false);
      setVerificationOpen(false);
      setResetPassOpen(false);
  };

  const openSignUpModal = () => {
      setIsSignUpOpen(true);
      setIsSignInOpen(false);
      setIsForgotPassOpen(false);
      setVerificationOpen(false);
      setResetPassOpen(false);
      setTermsOpen(false);
  };

  const openSignInModal = () => {
      setIsSignInOpen(true);
      setIsSignUpOpen(false);
      setIsForgotPassOpen(false);
      setVerificationOpen(false);
      setResetPassOpen(false);
      setTermsOpen(false);
  };

  const openForgotPassModal = () => {
      setIsForgotPassOpen(true);
      setIsSignInOpen(false);
      setIsSignUpOpen(false);
      setVerificationOpen(false);
      setResetPassOpen(false);
      setTermsOpen(false);
  };

  const openVerificationModal = () => {
      setVerificationOpen(true);
      setIsSignInOpen(false);
      setIsSignUpOpen(false);
      setIsForgotPassOpen(false);
      setResetPassOpen(false);
      setTermsOpen(false);
  };

  const openResetPassModal = () => {
      setResetPassOpen(true);
      setIsSignInOpen(false);
      setIsSignUpOpen(false);
      setIsForgotPassOpen(false);
      setVerificationOpen(false);
      setTermsOpen(false);
  };

  const openTermsModal = () => {
      setTermsOpen(true);
      setResetPassOpen(false);
      setIsSignInOpen(false);
      setIsSignUpOpen(false);
      setIsForgotPassOpen(false);
      setVerificationOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-5 sm:px-10 bg-white shadow-md z-50">
      <div className="flex items-center h-[3.5rem] max-w-full">
        <img src="/favicon.png" alt="Website Logo" className="w-[2.75rem] h-[2.75rem]" />
        <p className="pl-5 font-extrabold">DOGGO</p>
      </div>

      {/* Desktop Menu */}
      <ul className="hidden md:flex flex-row items-center space-x-10 ">
        <li>
          <a href="#" className="text-sm font-medium hover:text-yellow hover:transition duration-300" onClick={() => handleScrollTo('home')}>
            Home
          </a>
        </li>
        <li>
          <a href="#" className="text-sm font-medium hover:text-yellow hover:transition duration-300" onClick={() => handleScrollTo('about')}>
            About Us
          </a>
        </li>
        <li>
          <a href="#" className="text-sm font-medium hover:text-yellow hover:transition duration-300" onClick={() => handleScrollTo('contact')}>
            Contact Us
          </a>
        </li>
        <li>
          <button 
            className="text-sm font-medium text-white rounded-full bg-doggo px-3 py-2 hover:bg-yellow transition duration-300"
            onClick={toggleSignInModal} >
            Get Started
          </button>
        </li>
      </ul>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden flex items-center p-2 rounded-md focus:outline-none hover:text-yellow hover:transition duration-300"
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
            <a href="#" className="text-sm font-medium hover:text-yellow hover:transition duration-300" onClick={() => handleScrollTo('home')}>
              Home
            </a>
          </li>
          <li>
            <a href="#" className="text-sm font-medium hover:text-yellow hover:transition duration-300" onClick={() => handleScrollTo('about')}>
              About Us
            </a>
          </li>
          <li>
            <a href="#" className="text-sm font-medium hover:text-yellow hover:transition duration-300" onClick={() => handleScrollTo('contact')}>
              Contact Us
            </a>
          </li>
          <li>
            <button className="text-sm font-medium text-white rounded-full bg-doggo px-3 py-2 hover:bg-yellow transition duration-300"
              onClick={toggleSignInModal}>
              Get Started
            </button>
          </li>
        </ul>
      )}

            {isSignInOpen && <SignIn toggleModal={toggleSignInModal} openSignUpModal={openSignUpModal} openForgotPassModal={openForgotPassModal} />}
            {isSignUpOpen && <SignUp toggleModal={toggleSignUpModal} openSignInModal={openSignInModal} openTermsModal={openTermsModal} />}
            {isForgotPassOpen && <ForgotPassword toggleModal={toggleForgotPassModal} openSignInModal={openSignInModal} openVerificationModal={openVerificationModal}/>}
            {isVerificationOpen && <VerificationCard toggleModal={toggleVerificationModal} openSignInModal={openSignInModal} openResetPassModal={openResetPassModal} />}
            {isTermsOpen && <TermsOfUse toggleModal={toggleTermsModal} openSignUpModal={openSignUpModal}/>}
            {isResetPass && <ResetPassword toggleModal={toggleResetPassModal} toggleSignInModal={toggleSignInModal} />}
    </nav>
  );
}
