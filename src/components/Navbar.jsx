import { useState } from 'react';
import { CircleUser, LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NavbarTopConfigurationPage() {
    // State for managing mobile menu toggle
    const [isOpen, setIsOpen] = useState(false); 

    const [isDropdownOpen, setIsDropdownOpen] = useState(false); 

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const navigate = useNavigate(); // Initialize navigate

    const handleFetchingButtonClick = () => {
      navigate("/fetching-page");  // Redirect to the Fetching page
    };

    const handlePetCamButtonClick = () => {
        navigate("/petcam-page");  // Redirect to the PetCam page
    };

    const handleLandingPageClick = () => {
    navigate("/");  // Redirect to the Landing page
    };

    return (
        <nav className="w-full flex items-center justify-between px-5 sm:px-10 bg-white sm:shadow-md relative z-10">
            {/* Logo Section */}
            <div className="flex items-center h-[4rem] max-w-full">
                <button>
                    <div className="flex items-center h-[3.5rem] max-w-full"
                        onClick={handleLandingPageClick}
                    >
                        <img src="/favicon.png" alt="Website Logo" className="w-[2.75rem] h-[2.75rem]" />
                        <p className='pl-5 font-extrabold '>DOGGO</p>
                    </div>
                </button>
            </div>

            {/* Desktop Menu */}
            <ul className="hidden sm:flex sm:flex-row lg:mr-10 items-center space-x-10">
                <li>
                    <button  
                        className="text-md font-medium text-gray-600 hover:text-paymongo"
                        onClick={handlePetCamButtonClick}
                    >
                        Pet Cam
                    </button>
                </li>
                <li>
                    <button className="text-md font-medium text-gray-600 hover:text-paymongo">
                        Dashboard
                    </button>
                </li>
                <li>
                    <button 
                        className="text-md font-medium text-gray-600 hover:text-paymongo"
                        onClick={handleFetchingButtonClick}
                    >
                        Fetching Device
                    </button>
                </li>
                <li>
                    <button className="text-md font-medium text-gray-600 hover:text-paymongo">
                        Gallery
                    </button>
                </li>
                <li className="relative">
                    <button onClick={toggleDropdown} className="text-md font-medium text-gray-600 hover:text-paymongo">
                        <CircleUser aria-hidden="true" />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute z-100 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 top-12 right-0">
                            <ul className="py-2 text-sm text-gray-600 text-md font-medium">
                                <li>
                                    <button onClick={(e) => { e.preventDefault(); }} className="flex px-4 py-2 hover:text-paymongo">
                                        <User className='h-5 w-5 mr-2'/> Account
                                    </button>
                                </li>
                                <li>
                                    <button onClick={(e) => { e.preventDefault(); }} className="flex px-4 py-2 hover:text-paymongo">
                                        <Settings className='h-5 w-5 mr-2'/> Settings
                                    </button>
                                </li>
                                <li>
                                    <button onClick={(e) => { e.preventDefault(); }} className="flex px-4 py-2 hover:text-paymongo">
                                        <LogOut className='h-5 w-5 mr-2'/> Sign out
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </li>
            </ul>

            {/* Mobile Menu Button */}
            <button
                className="sm:hidden flex items-center p-2 rounded-md focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Hamburger Icon */}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Mobile Menu */}
            {isOpen && (
                <ul className="absolute top-16 left-0 w-full bg-white rounded-lg py-4 flex flex-col space-y-4 items-center sm:hidden shadow-md">
                    <li>
                        <button className="text-md font-medium"
                            onClick={handlePetCamButtonClick}
                        >
                            Pet Cam
                        </button>
                    </li>
                    <li>
                        <button className="text-md font-medium">
                            Dashboard
                        </button>
                    </li>
                    <li>
                        <button className="text-md font-medium"
                            onClick={handleFetchingButtonClick}
                        >
                            Fetching Device
                        </button>
                    </li>
                    <li>
                        <button className="text-md font-medium">
                            Gallery
                        </button>
                    </li>
                </ul>
            )}
        </nav>
    );
}