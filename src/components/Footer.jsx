import React from 'react';


const Footer = () => {
    return (
        <footer 
            className="bg-[#7A6251] text-black py-6 relative" 
            style={{
                backgroundImage: "url('/footerBG.png')", 
                backgroundSize: 'cover', 
                backgroundPosition: 'center', 
                height: '50vh' 
            }} 
        >
            {/* Centered Logo */}
            <div className="flex justify-center">
                <img 
                    src="/public/logo.png" 
                    alt="Logo"
                    className="w-32 h-auto mb-1" 
                />
            </div>

            <div className="container mx-auto text-center">
                {/* Quick Links Section */}
                <div className="flex flex-col items-start ml-20 "> {/* Add left margin */}
                    <h4 className="text-lg font-bold mb-2">Quick Links</h4>
                    <ul className="grid grid-cols-2 gap-y-2"> {/* 2-column layout with vertical spacing */}
                        <li className="flex items-center">
                            <i className="fas fa-arrow-right mr-2"></i>
                            <a href="#home" className="hover:text-gray-500">Home</a>
                        </li>
                        <li className="flex items-center">
                            <i className="fas fa-arrow-right mr-2"></i>
                            <a href="#contact" className="hover:text-gray-500">Contact Us</a>
                        </li>
                        <li className="flex items-center">
                            <i className="fas fa-arrow-right mr-2"></i>
                            <a href="#about" className="hover:text-gray-500">About Us</a>
                        </li>
                        <li className="flex items-center">
                            <i className="fas fa-arrow-right mr-2"></i>
                            <a href="#faqs" className="hover:text-gray-500">FAQs</a>
                        </li>
                        <li className="flex items-center">
                            <i className="fas fa-arrow-right mr-2"></i>
                            <a href="#team" className="hover:text-gray-500">Our Team</a>
                        </li>
                        <li className="flex items-center">
                            <i className="fas fa-arrow-right mr-2"></i>
                            <a href="#terms" className="hover:text-gray-500">Terms of Service and Privacy Policy</a>
                        </li>
                    </ul>
                </div>

                {/* Social Media Icons */}
                <div className="flex flex-col items-center space-y-2 mt-[-160px] ml-[1000px]">
                    <h5 className="text-lg font-bold">Follow Us</h5>
                    <div className="flex space-x-4">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500 text-3xl">
                            <i className="fab fa-facebook-f"></i>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500 text-3xl">
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500 text-3xl">
                            <i className="fab fa-twitter"></i>
                        </a>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="flex flex-col items-center mb-10 mt-[50px] ml-[1000px]">
                    <h4 className="text-lg font-bold mb-2">Subscribe to our Newsletter</h4>
                    <div className="relative flex mt-2"> {/* Centered the email input and button */}
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            className="p-2 rounded-l-lg border-none pl-10" 
                            required 
                        />
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
                            <i className="fas fa-dog"></i>
                        </span>
                        <button 
                            type="submit" 
                            className="bg-[#7A6251] text-white rounded-r-lg p-2 hover:bg-yellow transition"
                        >
                            Subscribe
                        </button>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="absolute bottom-2 right-2 text-sm">
                    <p className="mb-3 mr-3 text-white">&copy; {new Date().getFullYear()} Doggo. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
