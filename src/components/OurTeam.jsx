import React, { useState } from 'react';

const TeamMember = ({ name, role, image, description, onToggle, isOpen, onImageClick, isImageEnlarged }) => {
    return (
        <div id="team" className="flex flex-col items-center m-4">
            <img
                src={image}
                alt={`${name}'s photo`}
                onClick={onImageClick}
                className={`cursor-pointer rounded-full border-2 border-[#7A6251] mb-2 transition-transform duration-300 ${
                    isImageEnlarged ? 'w-64 h-64' : 'w-32 h-32'
                }`}
            />
            <h3 className="text-lg font-bold">{name}</h3>
            <p className="text-sm text-gray-600">{role}</p>
            <div className="flex space-x-4 mt-2">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-black text-2xl hover:text-gray-500">
                    <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-black text-2xl hover:text-gray-500">
                    <i className="fab fa-instagram"></i>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-black text-2xl hover:text-gray-500">
                    <i className="fab fa-linkedin-in"></i>
                </a>
            </div>
            <button 
                onClick={onToggle} 
                className="mt-2 bg-[#85522d] text-white rounded px-4 py-2 hover:bg-yellow transition"
            >
                {isOpen ? 'Hide Description' : 'Show Description'}
            </button>
            
            {isOpen && (
                <div className="mt-2 p-4 bg-gray-100 rounded shadow">
                    <p>{description}</p>
                </div>
            )}
        </div>
    );
};

const OurTeam = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [enlargedIndex, setEnlargedIndex] = useState(null);

    const teamMembers = [
        {
            name: 'Carla Jeanne B. Goleña',
            role: 'Team Leader',
            image: '/download.jpg',
            description: 'Oversees project execution and ensures team collaboration.'
        },
        {
            name: 'Noah B. Dorado',
            role: 'Computer Vision Lead',
            image: '/download.jpg',
            description: 'Leads the development of computer vision applications.'
        },
        {
            name: 'Ahijah Reign M. Reyes',
            role: 'Hardware Lead',
            image: '/download.jpg',
            description: 'Manages hardware design and integration.'
        },
        {
            name: 'Edel Mae T. Tapar',
            role: 'Website Development Lead',
            image: '/download.jpg',
            description: 'Directs the design and development of websites.'
        },
    ];

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleImageClick = (index) => {
        setEnlargedIndex(enlargedIndex === index ? null : index);
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center bg-cover bg-center px-4" 
            style={{ backgroundImage: 'url(/public/teamBG.png)' }} 
        >
            <div className="bg-opacity-70 bg-white py-10">
                <div className="container mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-6">Meet Our Team</h1>
                    <div className="flex flex-wrap justify-center items-center">
                        {teamMembers.map((member, index) => (
                            <TeamMember 
                                key={index} 
                                name={member.name} 
                                role={member.role} 
                                image={member.image} 
                                description={member.description} 
                                onToggle={() => handleToggle(index)}
                                isOpen={openIndex === index} 
                                onImageClick={() => handleImageClick(index)}
                                isImageEnlarged={enlargedIndex === index}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OurTeam;
