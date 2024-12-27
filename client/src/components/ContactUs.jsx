import '@fortawesome/fontawesome-free/css/all.min.css';
import React, { useState } from 'react';
import Footer from './Footer';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here
        console.log('Form submitted:', formData);
        // Reset the form
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div>
            {/* Contact Us Section */}
            <div id="contact" className="min-h-screen flex items-center justify-center bg-cover bg-center px-4" style={{ backgroundImage: "url('/assets/contactBG.png')" }}>
                <div className="flex flex-col md:flex-row bg-white bg-opacity-80 rounded-lg shadow-lg p-8 md:p-16 max-w-4xl w-full">
                    
                    {/* Left side: Contact Form */}
                    <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-[#7A6251] font-akshar">
                            Contact Us
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="4"
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-[#7A6251] text-white font-bold py-2 rounded-lg hover:bg-yellow hover:transition focus:outline-none focus:ring-2 focus:ring-[#7A6251] focus:ring-opacity-50"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Right side: Contact Information with Icons */}
                    <div className="md:w-1/2 text-center md:text-left mt-12 md:mt-0">
                        <h3 className="text-3xl md:text-4xl font-bold mb-10 text-center text-[#7A6251] font-akshar">
                            Get in Touch
                        </h3>
                        <p className="text-sm md:text-base mb-4 flex items-center justify-center md:justify-start ml-12">
                            <i className="fas fa-phone-alt mr-2"></i>
                            Phone: +123 456 7890
                        </p>
                        <p className="text-sm md:text-base mb-4 flex items-center justify-center md:justify-start ml-12">
                            <i className="fas fa-envelope mr-2"></i>
                            Email: info@doggo.com
                        </p>
                        <p className="text-sm md:text-base flex items-center justify-center md:justify-start ml-12">
                            <i className="fas fa-map-marker-alt mr-2"></i>
                            Address: 123 Doggo Lane, Dogtown, DOG
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default ContactUs;
